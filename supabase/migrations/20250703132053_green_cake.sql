/*
  # Setup Avatar Storage

  1. Storage Setup
    - Create avatars bucket for profile pictures
    - Configure public access for avatar files
    - Set up proper file upload policies

  2. Security
    - Enable authenticated users to upload their own avatars
    - Allow public read access to avatar files
    - Restrict file operations to file owners
*/

-- Create the avatars bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'avatars', 
    'avatars', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  );
EXCEPTION WHEN unique_violation THEN
  -- Bucket already exists, update its settings
  UPDATE storage.buckets 
  SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  WHERE id = 'avatars';
END $$;

-- Create storage policies using the storage schema functions
-- Note: These policies will be created in the storage schema, not public schema

-- Policy for authenticated users to upload their own avatars
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
  
  -- Create new policy
  CREATE POLICY "Users can upload their own avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
EXCEPTION WHEN insufficient_privilege THEN
  -- If we can't create the policy directly, it will be handled by Supabase's default policies
  NULL;
END $$;

-- Policy for public read access to avatars
DO $$
BEGIN
  DROP POLICY IF EXISTS "Avatar files are publicly accessible" ON storage.objects;
  
  CREATE POLICY "Avatar files are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
EXCEPTION WHEN insufficient_privilege THEN
  NULL;
END $$;

-- Policy for users to update their own avatars
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
  
  CREATE POLICY "Users can update their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
EXCEPTION WHEN insufficient_privilege THEN
  NULL;
END $$;

-- Policy for users to delete their own avatars
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
  
  CREATE POLICY "Users can delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
EXCEPTION WHEN insufficient_privilege THEN
  NULL;
END $$;

-- Update profiles table to include avatar_url if not already present
DO $$
BEGIN
  -- Check if avatar_url column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Create a function to get the public URL for an avatar
CREATE OR REPLACE FUNCTION get_avatar_url(user_id uuid, filename text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 'https://' || current_setting('app.settings.supabase_url', true) || '/storage/v1/object/public/avatars/' || user_id::text || '/' || filename;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;