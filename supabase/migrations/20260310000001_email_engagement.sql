-- Track emails sent to users for engagement (prevents duplicates and enables unsubscribe)
create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_type text not null,        -- e.g. 'generated_never_published', 'drip_welcome', 'site_published'
  project_id uuid references public.projects(id) on delete set null,
  resend_message_id text,
  sent_at timestamptz not null default now()
);

-- Index for dedup queries: "has this user already received this email type (for this project)?"
create index idx_email_log_user_type on public.email_log(user_id, email_type);
create index idx_email_log_user_project_type on public.email_log(user_id, project_id, email_type);

-- Per-user email preferences
create table public.email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unsubscribed_all boolean not null default false,
  unsubscribed_drip boolean not null default false,
  unsubscribed_reengagement boolean not null default false,
  updated_at timestamptz not null default now()
);

-- RLS: email_log is service-role only (cron job writes, users don't need access)
alter table public.email_log enable row level security;
alter table public.email_preferences enable row level security;

-- Users can read and update their own preferences
create policy "Users can read own email preferences"
  on public.email_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own email preferences"
  on public.email_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert own email preferences"
  on public.email_preferences for insert
  with check (auth.uid() = user_id);
