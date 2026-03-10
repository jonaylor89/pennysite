-- Users who generated a site 24h+ ago but never published
create or replace function get_generated_never_published()
returns table(user_id uuid, email text, project_id uuid, project_name text)
language sql stable security definer
as $$
  select p.user_id, u.email, p.id as project_id, p.name as project_name
  from public.projects p
  join auth.users u on u.id = p.user_id
  left join public.email_preferences ep on ep.user_id = p.user_id
  where p.deployed_url is null
    and p.created_at < now() - interval '24 hours'
    and p.pages::text != '{}' and p.pages::text != '[]' and p.pages::text != 'null'
    and (ep.unsubscribed_all is not true and ep.unsubscribed_reengagement is not true)
    and not exists (
      select 1 from public.email_log el
      where el.user_id = p.user_id
        and el.project_id = p.id
        and el.email_type = 'generated_never_published'
    )
$$;

-- Users who created a project 3+ days ago, never edited since (created_at ≈ updated_at)
create or replace function get_created_never_edited()
returns table(user_id uuid, email text, project_id uuid, project_name text)
language sql stable security definer
as $$
  select p.user_id, u.email, p.id as project_id, p.name as project_name
  from public.projects p
  join auth.users u on u.id = p.user_id
  left join public.email_preferences ep on ep.user_id = p.user_id
  where p.created_at < now() - interval '3 days'
    and p.updated_at < p.created_at + interval '1 hour'
    and p.pages::text != '{}' and p.pages::text != '[]' and p.pages::text != 'null'
    and (ep.unsubscribed_all is not true and ep.unsubscribed_reengagement is not true)
    and not exists (
      select 1 from public.email_log el
      where el.user_id = p.user_id
        and el.project_id = p.id
        and el.email_type = 'created_never_edited'
    )
$$;

-- Users with published sites not edited in 30+ days
create or replace function get_published_no_edits()
returns table(user_id uuid, email text, project_id uuid, project_name text)
language sql stable security definer
as $$
  select p.user_id, u.email, p.id as project_id, p.name as project_name
  from public.projects p
  join auth.users u on u.id = p.user_id
  left join public.email_preferences ep on ep.user_id = p.user_id
  where p.deployed_url is not null
    and p.updated_at < now() - interval '30 days'
    and (ep.unsubscribed_all is not true and ep.unsubscribed_reengagement is not true)
    and not exists (
      select 1 from public.email_log el
      where el.user_id = p.user_id
        and el.project_id = p.id
        and el.email_type = 'published_no_edits'
    )
$$;

-- Users with credits who haven't generated in 14+ days
create or replace function get_has_credits_idle()
returns table(user_id uuid, email text, available_credits bigint)
language sql stable security definer
as $$
  select cb.user_id, u.email, cb.available_credits
  from (
    select user_id, available_credits
    from (
      select user_id, (get_credit_balance(user_id)).available_credits
      from (select distinct user_id from public.generations) gen_users
    ) balances
    where available_credits > 0
  ) cb
  join auth.users u on u.id = cb.user_id
  left join public.email_preferences ep on ep.user_id = cb.user_id
  where not exists (
    select 1 from public.generations g
    where g.user_id = cb.user_id
      and g.created_at > now() - interval '14 days'
  )
  and (ep.unsubscribed_all is not true and ep.unsubscribed_reengagement is not true)
  and not exists (
    select 1 from public.email_log el
    where el.user_id = cb.user_id
      and el.email_type = 'has_credits_idle'
      and el.sent_at > now() - interval '30 days'
  )
$$;

-- Users who purchased credits 48h+ ago but never generated
create or replace function get_purchased_never_generated()
returns table(user_id uuid, email text)
language sql stable security definer
as $$
  select distinct g.user_id, u.email
  from public.generations g
  join auth.users u on u.id = g.user_id
  left join public.email_preferences ep on ep.user_id = g.user_id
  where g.status = 'completed'
    and g.user_id not in (
      select distinct user_id from public.projects
      where pages::text != '{}' and pages::text != '[]' and pages::text != 'null'
    )
    and u.created_at < now() - interval '48 hours'
    and (ep.unsubscribed_all is not true and ep.unsubscribed_reengagement is not true)
    and not exists (
      select 1 from public.email_log el
      where el.user_id = g.user_id
        and el.email_type = 'purchased_never_generated'
    )
$$;

-- Users eligible for a drip email at N days after signup, who haven't received it yet
create or replace function get_drip_eligible(p_drip_type text, p_days_after_signup int)
returns table(user_id uuid, email text)
language sql stable security definer
as $$
  select u.id as user_id, u.email
  from auth.users u
  left join public.email_preferences ep on ep.user_id = u.id
  where u.created_at::date = (now() - make_interval(days => p_days_after_signup))::date
    and (ep.unsubscribed_all is not true and ep.unsubscribed_drip is not true)
    and not exists (
      select 1 from public.email_log el
      where el.user_id = u.id
        and el.email_type = p_drip_type
    )
$$;
