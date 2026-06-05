-- ============================================================
-- KAYROSCO ADMIN SCHEMA v7
-- Adds priority, links (demos/repos/figma/etc.) and checklist
-- to service_requests so admin can manage richer project info.
-- Run in Supabase SQL Editor after v6.
-- ============================================================

ALTER TABLE service_requests
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ADD COLUMN IF NOT EXISTS links    jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '[]'::jsonb;
