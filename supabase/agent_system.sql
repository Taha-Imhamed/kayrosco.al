create extension if not exists pgcrypto;

create table if not exists public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('public', 'internal')),
  department text check (department in ('tech', 'consulting', 'travel')),
  status text not null default 'open',
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.agent_conversations(id) on delete cascade,
  sender text not null check (sender in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_work (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.agent_conversations(id) on delete set null,
  client_name text not null,
  client_email text,
  client_phone text,
  department text not null check (department in ('tech', 'consulting', 'travel')),
  service_type text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'waiting_for_client', 'completed', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  country text,
  preferred_contact_method text,
  summary text,
  structured_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_documents (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.agent_conversations(id) on delete cascade,
  work_id uuid references public.agent_work(id) on delete cascade,
  bucket text not null default 'agent-documents',
  storage_path text,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  document_kind text not null default 'supporting-document',
  created_at timestamptz not null default now()
);

create table if not exists public.agent_internal_notes (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.agent_work(id) on delete cascade,
  author_id uuid,
  author_name text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_assignments (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null unique references public.agent_work(id) on delete cascade,
  worker_id uuid,
  worker_name text,
  assigned_by uuid,
  assigned_by_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agent_messages_conversation_created
  on public.agent_messages (conversation_id, created_at);
create index if not exists idx_agent_work_department_status_created
  on public.agent_work (department, status, created_at desc);
create index if not exists idx_agent_work_priority
  on public.agent_work (priority);
create index if not exists idx_agent_documents_work
  on public.agent_documents (work_id);
create index if not exists idx_agent_notes_work_created
  on public.agent_internal_notes (work_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_agent_conversations_updated_at on public.agent_conversations;
create trigger trg_agent_conversations_updated_at
before update on public.agent_conversations
for each row execute function public.set_updated_at();

drop trigger if exists trg_agent_work_updated_at on public.agent_work;
create trigger trg_agent_work_updated_at
before update on public.agent_work
for each row execute function public.set_updated_at();

drop trigger if exists trg_agent_notes_updated_at on public.agent_internal_notes;
create trigger trg_agent_notes_updated_at
before update on public.agent_internal_notes
for each row execute function public.set_updated_at();

drop trigger if exists trg_agent_assignments_updated_at on public.agent_assignments;
create trigger trg_agent_assignments_updated_at
before update on public.agent_assignments
for each row execute function public.set_updated_at();

alter table public.agent_conversations enable row level security;
alter table public.agent_messages enable row level security;
alter table public.agent_work enable row level security;
alter table public.agent_documents enable row level security;
alter table public.agent_internal_notes enable row level security;
alter table public.agent_assignments enable row level security;

drop policy if exists "service role full access conversations" on public.agent_conversations;
create policy "service role full access conversations"
on public.agent_conversations
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "service role full access messages" on public.agent_messages;
create policy "service role full access messages"
on public.agent_messages
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "service role full access work" on public.agent_work;
create policy "service role full access work"
on public.agent_work
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "service role full access documents" on public.agent_documents;
create policy "service role full access documents"
on public.agent_documents
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "service role full access notes" on public.agent_internal_notes;
create policy "service role full access notes"
on public.agent_internal_notes
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "service role full access assignments" on public.agent_assignments;
create policy "service role full access assignments"
on public.agent_assignments
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

insert into storage.buckets (id, name, public)
values ('agent-documents', 'agent-documents', true)
on conflict (id) do nothing;

drop policy if exists "service role upload agent documents" on storage.objects;
create policy "service role upload agent documents"
on storage.objects
for all
using (bucket_id = 'agent-documents' and auth.role() = 'service_role')
with check (bucket_id = 'agent-documents' and auth.role() = 'service_role');
