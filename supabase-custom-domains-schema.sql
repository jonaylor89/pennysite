-- Custom domains for user projects
-- Run this in your Supabase SQL editor after supabase-deployment-schema.sql

-- Add custom domain columns to projects table
alter table public.projects
add column if not exists custom_domain text,
add column if not exists custom_domain_status text check (custom_domain_status in ('pending', 'active', 'error')),
add column if not exists custom_domain_added_at timestamp with time zone;

-- Index for looking up projects by custom domain
create unique index if not exists projects_custom_domain_idx on public.projects(custom_domain) where custom_domain is not null;

-- Comments for documentation
comment on column public.projects.custom_domain is 'User-configured custom domain (e.g., blog.example.com)';
comment on column public.projects.custom_domain_status is 'DNS verification status: pending, active, or error';
comment on column public.projects.custom_domain_added_at is 'When the custom domain was configured';
