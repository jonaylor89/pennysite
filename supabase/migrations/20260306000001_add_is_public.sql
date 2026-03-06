-- Add is_public column to projects for public sharing
alter table public.projects add column is_public boolean not null default false;

-- Allow anyone to view public projects (no auth required)
create policy "Public projects are viewable by anyone"
  on public.projects for select
  using (is_public = true);

-- Index for efficient public project queries
create index projects_is_public_idx on public.projects(is_public) where is_public = true;
