-- Create storage bucket for portfolio if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'portfolio', 
    'portfolio', 
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
  );
EXCEPTION WHEN unique_violation THEN
  -- Bucket already exists, update its settings
  UPDATE storage.buckets 
  SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
  WHERE id = 'portfolio';
END $$;

-- Set up RLS policies for portfolio bucket
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Portfolio items are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload to their own portfolio" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own portfolio items" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own portfolio items" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "Portfolio items are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'portfolio');

  CREATE POLICY "Users can upload to their own portfolio"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "Users can update their own portfolio items"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "Users can delete their own portfolio items"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
EXCEPTION WHEN insufficient_privilege THEN
  -- If we can't create the policy directly, it will be handled by Supabase's default policies
  NULL;
END $$;

-- Update profiles table to ensure portfolio column exists
DO $$
BEGIN
  -- Check if portfolio column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'portfolio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN portfolio jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;