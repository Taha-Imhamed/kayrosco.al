-- ============================================================
-- KAYROSCO ADMIN SCHEMA v6
-- Fix service_requests RLS so:
--   1. Anonymous users can INSERT (public form submit)  ← was already allowed
--   2. Anonymous users can SELECT (admin dashboard uses anon key with custom auth)
--   3. Anonymous users can UPDATE (admin processing requests)
--
-- The Kayrosco admin panel uses a custom admin_users table, NOT Supabase auth.
-- So is_admin() (which checks auth.uid()) always returns false for admin users.
-- We follow the same pattern as admin tables: disable RLS and protect via app logic.
-- ============================================================

-- Drop the old auth-dependent policies
drop policy if exists "service_requests_admin_select" on service_requests;
drop policy if exists "service_requests_admin_update" on service_requests;
drop policy if exists "service_requests_public_insert" on service_requests;

-- Disable RLS — protected by custom app-level auth (same as admin_users, contracts, etc.)
alter table service_requests disable row level security;

-- Also open workers table so admin dashboard can read worker list for assignment
drop policy if exists "workers_admin_access" on workers;
alter table workers disable row level security;

-- And request_files
drop policy if exists "request_files_admin_select" on request_files;
drop policy if exists "request_files_public_insert" on request_files;
alter table request_files disable row level security;
