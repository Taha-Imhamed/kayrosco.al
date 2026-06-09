-- ============================================================
-- KAYROSCO STORAGE BUCKETS
-- Run this in the Supabase SQL editor to create required buckets.
-- ============================================================

-- Tech project images (public portfolio photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tech-project-images',
  'tech-project-images',
  true,
  5242880,   -- 5 MB limit
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to read public images
DROP POLICY IF EXISTS "public read tech-project-images" ON storage.objects;
CREATE POLICY "public read tech-project-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tech-project-images');

-- Allow authenticated admins to upload/delete
DROP POLICY IF EXISTS "admin upload tech-project-images" ON storage.objects;
CREATE POLICY "admin upload tech-project-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tech-project-images');

DROP POLICY IF EXISTS "admin delete tech-project-images" ON storage.objects;
CREATE POLICY "admin delete tech-project-images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tech-project-images');
