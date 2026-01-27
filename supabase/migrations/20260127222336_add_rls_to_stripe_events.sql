-- Enable RLS on stripe_events (no policies = only accessible via security definer functions)
alter table public.stripe_events enable row level security;
