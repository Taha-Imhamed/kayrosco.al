-- ============================================================
-- KAYROSCO ADMIN SCHEMA V4 — Tickets + Deals
-- ============================================================
-- Run after admin_schema_v3.sql.
-- ============================================================

-- ── 1. Tickets ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id            uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name          text,
  title                text NOT NULL,
  description          text,
  status               text NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open', 'in_progress', 'done')),
  priority             text NOT NULL DEFAULT 'medium'
                         CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  department           text CHECK (department IN ('tech', 'consulting', 'travel', 'admin')),
  -- JSON array: [{type: 'link'|'file', name, url, uploaded_at}]
  attachments          jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes                text,
  created_by           uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_by_username  text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz
);
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- ── 2. Deals ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                    text NOT NULL,
  description              text,
  client_id                uuid REFERENCES clients(id) ON DELETE SET NULL,
  client_name              text,
  department               text CHECK (department IN ('tech', 'consulting', 'travel', 'admin')),
  expected_value           numeric(14,2) NOT NULL DEFAULT 0,
  due_date                 date,
  is_done                  boolean NOT NULL DEFAULT false,
  payment_received         boolean NOT NULL DEFAULT false,
  payment_amount           numeric(14,2),
  payment_date             timestamptz,
  payment_added_to_balance boolean NOT NULL DEFAULT false,
  is_archived              boolean NOT NULL DEFAULT false,
  created_by               uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_by_username      text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz
);
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;

-- ── 3. Storage bucket for ticket attachments ─────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-docs',
  'ticket-docs',
  true,
  52428800,
  ARRAY['application/pdf','image/jpeg','image/png','image/webp','image/gif',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- ── 4. Storage RLS — anon access to ticket-docs ──────────────────────────────
DROP POLICY IF EXISTS "ticket_docs_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "ticket_docs_anon_select" ON storage.objects;
DROP POLICY IF EXISTS "ticket_docs_anon_delete" ON storage.objects;
DROP POLICY IF EXISTS "ticket_docs_anon_update" ON storage.objects;

CREATE POLICY "ticket_docs_anon_insert"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'ticket-docs');

CREATE POLICY "ticket_docs_anon_select"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'ticket-docs');

CREATE POLICY "ticket_docs_anon_delete"
ON storage.objects FOR DELETE TO anon
USING (bucket_id = 'ticket-docs');

CREATE POLICY "ticket_docs_anon_update"
ON storage.objects FOR UPDATE TO anon
USING (bucket_id = 'ticket-docs');

-- ── Done ─────────────────────────────────────────────────────────────────────
-- After running, refresh Supabase. The ticket-docs bucket will appear in Storage.
