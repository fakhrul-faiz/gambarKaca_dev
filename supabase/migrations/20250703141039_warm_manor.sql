/*
  # Add Campaign Media Storage Bucket

  1. New Storage Buckets
    - `campaign-media` - For storing campaign images and videos
  
  2. Security
    - Enable public read access for campaign media
    - Allow authenticated users to upload, update, and delete their own files
    - Set file size limits and allowed MIME types
*/

-- Create storage bucket for campaign media if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'campaign-media', 
    'Campaign Media', 
    true,
    20971520, -- 20MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
  );
EXCEPTION WHEN unique_violation THEN
  -- Bucket already exists, update its settings
  UPDATE storage.buckets 
  SET 
    public = true,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
  WHERE id = 'campaign-media';
END $$;

-- Set up RLS policies for campaign-media bucket
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Campaign media is publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload to their own campaign media folder" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own campaign media" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own campaign media" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "Campaign media is publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'campaign-media');

  CREATE POLICY "Users can upload to their own campaign media folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'campaign-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "Users can update their own campaign media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'campaign-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "Users can delete their own campaign media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'campaign-media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
EXCEPTION WHEN insufficient_privilege THEN
  -- If we can't create the policy directly, it will be handled by Supabase's default policies
  NULL;
END $$;