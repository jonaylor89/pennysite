-- Add conversation history to projects table
alter table public.projects
add column if not exists conversation jsonb not null default '[]';

comment on column public.projects.conversation is 'Array of chat messages [{role: "user"|"assistant", content: string}]';
