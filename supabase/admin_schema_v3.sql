-- ============================================================
-- KAYROSCO ADMIN SCHEMA V3 — Clients + Document Storage
-- ============================================================
-- Run in Supabase SQL Editor: Project → SQL Editor → New Query
--
-- STEP 1: If you haven't run admin_schema_v2.sql yet, run it first.
-- STEP 2: Then run this file.
-- ============================================================

-- ── 1. Ensure the clients table exists (safe re-run) ─────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,
  contact_name         text,
  contact_email        text,
  contact_phone        text,
  department           text CHECK (department IN ('tech','consulting','travel')),
  notes                text,
  is_active            boolean NOT NULL DEFAULT true,
  created_by           uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_by_username  text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz
);

-- ── 2. Add extended client fields (safe to run multiple times) ───────────────
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS id_number    text,
  ADD COLUMN IF NOT EXISTS nationality  text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS address      text,
  ADD COLUMN IF NOT EXISTS city         text,
  ADD COLUMN IF NOT EXISTS country      text,
  -- Stored file references (public URL + original filename)
  ADD COLUMN IF NOT EXISTS passport_url  text,
  ADD COLUMN IF NOT EXISTS passport_name text,
  ADD COLUMN IF NOT EXISTS id_doc_url    text,
  ADD COLUMN IF NOT EXISTS id_doc_name   text,
  -- Extra documents as JSON array: [{name, url, uploaded_at}]
  ADD COLUMN IF NOT EXISTS extra_docs    jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Disable RLS (same pattern as other tables in this project)
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- ── 3. Create the client-docs storage bucket ──────────────────────────────────
--  Files uploaded here are accessed via their public URL.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-docs',
  'client-docs',
  true,
  52428800,   -- 50 MB per file
  ARRAY['application/pdf','image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ── 4. Storage RLS — allow the anon key (used by this app) to read & write ───
--  Since Kayrosco Admin uses a custom auth (not Supabase Auth),
--  we grant the anon role full access to this bucket.

DROP POLICY IF EXISTS "client_docs_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "client_docs_anon_select" ON storage.objects;
DROP POLICY IF EXISTS "client_docs_anon_delete" ON storage.objects;
DROP POLICY IF EXISTS "client_docs_anon_update" ON storage.objects;

CREATE POLICY "client_docs_anon_insert"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'client-docs');

CREATE POLICY "client_docs_anon_select"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'client-docs');

CREATE POLICY "client_docs_anon_delete"
ON storage.objects FOR DELETE TO anon
USING (bucket_id = 'client-docs');

CREATE POLICY "client_docs_anon_update"
ON storage.objects FOR UPDATE TO anon
USING (bucket_id = 'client-docs');

-- ── Done ──────────────────────────────────────────────────────────────────────
-- After running this, refresh your Supabase project.
-- The "client-docs" bucket will appear under Storage in the dashboard.
