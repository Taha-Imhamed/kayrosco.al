-- ============================================================
-- KAYROSCO TECH PROJECTS v1
-- Public portfolio / service offerings board.
-- Admin can post projects (done work or available services);
-- clients see them on the Tech page.
-- ============================================================

CREATE TABLE IF NOT EXISTS tech_projects (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text,
  photo_url   text,
  link        text,
  status      text        NOT NULL DEFAULT 'done'
                CHECK (status IN ('done', 'available', 'in_progress')),
  tags        text[]      NOT NULL DEFAULT '{}',
  order_index integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Allow anyone to read (public portfolio)
ALTER TABLE tech_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_tech_projects"
  ON tech_projects FOR SELECT USING (true);

-- Allow all for service role / admin (Supabase uses service role for admin)
CREATE POLICY "admin_all_tech_projects"
  ON tech_projects FOR ALL USING (true);
