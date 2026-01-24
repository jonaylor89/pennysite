-- Pennysite billing schema
-- Run this in your Supabase SQL editor AFTER supabase-schema.sql

-- 1) Stripe customer mapping
create table public.stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamptz not null default now()
);

alter table public.stripe_customers enable row level security;

create policy "Users can view own stripe customer"
  on public.stripe_customers for select
  using (auth.uid() = user_id);


-- 2) Credit account (current balances)
create table public.credit_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available_credits integer not null default 0,
  reserved_credits integer not null default 0,
  lifetime_purchased_credits integer not null default 0,
  lifetime_spent_credits integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.credit_accounts enable row level security;

create policy "Users can view own credit account"
  on public.credit_accounts for select
  using (auth.uid() = user_id);


-- 3) Ledger (append-only, auditable)
create type public.credit_ledger_type as enum (
  'purchase',     -- +credits after Stripe webhook
  'reserve',      -- move available -> reserved
  'spend',        -- reserved -> spent (finalized)
  'release',      -- reserved -> available (refund on failure or unused)
  'adjustment'    -- manual admin adjustments
);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.credit_ledger_type not null,
  delta_available integer not null default 0,
  delta_reserved integer not null default 0,
  delta_lifetime_purchased integer not null default 0,
  delta_lifetime_spent integer not null default 0,
  reference text, -- stripe_event_id, generation_id, admin note, etc.
  created_at timestamptz not null default now()
);

alter table public.credit_ledger enable row level security;

create policy "Users can view own credit ledger"
  on public.credit_ledger for select
  using (auth.uid() = user_id);

create index credit_ledger_user_id_created_at_idx
  on public.credit_ledger(user_id, created_at desc);


-- 4) Generations table (tracks each generation with token usage)
create type public.generation_status as enum ('reserved', 'completed', 'failed');

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  reserved_credits integer not null,
  actual_credits integer, -- calculated after generation completes
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  status public.generation_status not null default 'reserved',
  idempotency_key text not null,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.generations enable row level security;

create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create index generations_user_id_created_at_idx
  on public.generations(user_id, created_at desc);

create unique index generations_user_id_idempotency_key_idx
  on public.generations(user_id, idempotency_key);


-- 5) Stripe events (idempotency for webhooks)
create table public.stripe_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);


-- ============================================================================
-- RPC Functions (atomic credit operations)
-- ============================================================================

-- Ensure credit account exists for a user
create or replace function public.ensure_credit_account(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.credit_accounts(user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;
end;
$$;


-- Reserve credits before generation starts
-- Returns generation_id on success, raises exception on insufficient credits
create or replace function public.reserve_credits_for_generation(
  p_user_id uuid,
  p_reserved_credits integer,
  p_idempotency_key text,
  p_project_id uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_gen_id uuid;
  v_available int;
begin
  perform public.ensure_credit_account(p_user_id);

  -- Idempotency: if we already reserved for this request, return that generation id
  select id into v_gen_id
  from public.generations
  where user_id = p_user_id and idempotency_key = p_idempotency_key;

  if v_gen_id is not null then
    return v_gen_id;
  end if;

  -- Lock account row for update
  select available_credits into v_available
  from public.credit_accounts
  where user_id = p_user_id
  for update;

  if v_available < p_reserved_credits then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  -- Create generation record
  insert into public.generations(user_id, project_id, reserved_credits, status, idempotency_key)
  values (p_user_id, p_project_id, p_reserved_credits, 'reserved', p_idempotency_key)
  returning id into v_gen_id;

  -- Move credits from available to reserved
  update public.credit_accounts
  set available_credits = available_credits - p_reserved_credits,
      reserved_credits  = reserved_credits + p_reserved_credits,
      updated_at = now()
  where user_id = p_user_id;

  -- Log to ledger
  insert into public.credit_ledger(
    user_id, type, delta_available, delta_reserved, reference
  )
  values (
    p_user_id, 'reserve', -p_reserved_credits, +p_reserved_credits, v_gen_id::text
  );

  return v_gen_id;
end;
$$;


-- Finalize generation: spend actual credits, release unused back to available
create or replace function public.finalize_generation_credits(
  p_user_id uuid,
  p_generation_id uuid,
  p_success boolean,
  p_actual_credits integer default null,
  p_input_tokens integer default null,
  p_output_tokens integer default null,
  p_total_tokens integer default null,
  p_error text default null
)
returns void
language plpgsql
security definer
as $$
declare
  v_reserved int;
  v_status public.generation_status;
  v_to_spend int;
  v_to_release int;
begin
  -- Get and lock generation record
  select reserved_credits, status into v_reserved, v_status
  from public.generations
  where id = p_generation_id and user_id = p_user_id
  for update;

  if v_status <> 'reserved' then
    -- Already finalized; no-op
    return;
  end if;

  -- Lock account
  perform 1 from public.credit_accounts where user_id = p_user_id for update;

  if p_success then
    -- Calculate actual spend (capped at reserved amount)
    v_to_spend := least(coalesce(p_actual_credits, v_reserved), v_reserved);
    v_to_release := v_reserved - v_to_spend;

    -- Update generation record
    update public.generations
    set status = 'completed',
        actual_credits = v_to_spend,
        input_tokens = p_input_tokens,
        output_tokens = p_output_tokens,
        total_tokens = p_total_tokens,
        completed_at = now()
    where id = p_generation_id;

    -- Spend credits
    update public.credit_accounts
    set reserved_credits = reserved_credits - v_reserved,
        available_credits = available_credits + v_to_release,
        lifetime_spent_credits = lifetime_spent_credits + v_to_spend,
        updated_at = now()
    where user_id = p_user_id;

    -- Log spend
    insert into public.credit_ledger(
      user_id, type, delta_reserved, delta_lifetime_spent, reference
    )
    values (p_user_id, 'spend', -v_to_spend, +v_to_spend, p_generation_id::text);

    -- Log release of unused credits (if any)
    if v_to_release > 0 then
      insert into public.credit_ledger(
        user_id, type, delta_reserved, delta_available, reference
      )
      values (p_user_id, 'release', -v_to_release, +v_to_release, p_generation_id::text);
    end if;

  else
    -- Failed: release all reserved credits back to available
    update public.generations
    set status = 'failed',
        error = p_error,
        input_tokens = p_input_tokens,
        output_tokens = p_output_tokens,
        total_tokens = p_total_tokens,
        completed_at = now()
    where id = p_generation_id;

    update public.credit_accounts
    set reserved_credits = reserved_credits - v_reserved,
        available_credits = available_credits + v_reserved,
        updated_at = now()
    where user_id = p_user_id;

    insert into public.credit_ledger(
      user_id, type, delta_reserved, delta_available, reference
    )
    values (p_user_id, 'release', -v_reserved, +v_reserved, p_generation_id::text);
  end if;
end;
$$;


-- Add credits after successful Stripe payment (called by webhook)
create or replace function public.add_credits_from_purchase(
  p_user_id uuid,
  p_credits integer,
  p_stripe_event_id text
)
returns boolean
language plpgsql
security definer
as $$
begin
  -- Idempotency: check if we already processed this event
  if exists (select 1 from public.stripe_events where event_id = p_stripe_event_id) then
    return false;
  end if;

  -- Record event
  insert into public.stripe_events(event_id) values (p_stripe_event_id);

  -- Ensure account exists
  perform public.ensure_credit_account(p_user_id);

  -- Add credits
  update public.credit_accounts
  set available_credits = available_credits + p_credits,
      lifetime_purchased_credits = lifetime_purchased_credits + p_credits,
      updated_at = now()
  where user_id = p_user_id;

  -- Log to ledger
  insert into public.credit_ledger(
    user_id, type, delta_available, delta_lifetime_purchased, reference
  )
  values (p_user_id, 'purchase', +p_credits, +p_credits, p_stripe_event_id);

  return true;
end;
$$;


-- Get user's credit balance
create or replace function public.get_credit_balance(p_user_id uuid)
returns table(available_credits integer, reserved_credits integer)
language plpgsql
security definer
as $$
begin
  perform public.ensure_credit_account(p_user_id);
  
  return query
  select ca.available_credits, ca.reserved_credits
  from public.credit_accounts ca
  where ca.user_id = p_user_id;
end;
$$;
