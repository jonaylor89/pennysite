-- Deployment fields for Cloudflare Pages publishing
-- Run this in your Supabase SQL editor after supabase-schema.sql

-- Add deployment columns to projects table
alter table public.projects
add column if not exists cf_project_name text,
add column if not exists deployed_url text,
add column if not exists last_deployed_at timestamp with time zone;

-- Index for finding deployed projects
create index if not exists projects_cf_project_name_idx on public.projects(cf_project_name);
