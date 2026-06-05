-- ============================================================
-- KAYROSCO ADMIN SCHEMA V5
-- Run after admin_schema_v4.sql
-- ============================================================

-- ── 1. Expense claims — balance account tracking ─────────────────────────────
ALTER TABLE expense_claims
  ADD COLUMN IF NOT EXISTS balance_account_id   text,
  ADD COLUMN IF NOT EXISTS balance_account_name text,
  ADD COLUMN IF NOT EXISTS balance_deducted     boolean NOT NULL DEFAULT false;

-- ── 2. Revenue — balance account tracking ────────────────────────────────────
ALTER TABLE revenue
  ADD COLUMN IF NOT EXISTS balance_account_id   text,
  ADD COLUMN IF NOT EXISTS balance_account_name text,
  ADD COLUMN IF NOT EXISTS balance_credited      boolean NOT NULL DEFAULT false;

-- ── 3. Admin users — multiple roles ──────────────────────────────────────────
-- roles is a JSON array of additional AdminRole strings beyond the primary role
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS roles jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ── 4. Company info — expanded fields ────────────────────────────────────────
ALTER TABLE company_info
  ADD COLUMN IF NOT EXISTS website             text,
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS vat_number          text,
  ADD COLUMN IF NOT EXISTS industry            text,
  ADD COLUMN IF NOT EXISTS important_notes     text,
  -- contacts: [{name, role, phone, email}]
  ADD COLUMN IF NOT EXISTS contacts            jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- docs: [{name, url, uploaded_at}]
  ADD COLUMN IF NOT EXISTS docs                jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ── 5. Company docs storage bucket ───────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-docs',
  'company-docs',
  true,
  52428800,
  ARRAY['application/pdf','image/jpeg','image/png','image/webp',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "company_docs_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "company_docs_anon_select" ON storage.objects;
DROP POLICY IF EXISTS "company_docs_anon_delete" ON storage.objects;

CREATE POLICY "company_docs_anon_insert" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'company-docs');
CREATE POLICY "company_docs_anon_select" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'company-docs');
CREATE POLICY "company_docs_anon_delete" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'company-docs');

-- ── Done ─────────────────────────────────────────────────────────────────────
