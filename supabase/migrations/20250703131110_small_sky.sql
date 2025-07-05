-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for portfolio if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Set up RLS policies for portfolio bucket
CREATE POLICY "Portfolio items are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload to their own portfolio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own portfolio items"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own portfolio items"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add helper function to get user's avatar URL
CREATE OR REPLACE FUNCTION get_user_avatar_url(user_id uuid)
RETURNS text AS $$
DECLARE
  avatar_url text;
BEGIN
  SELECT storage.foldername(name) INTO avatar_url
  FROM storage.objects
  WHERE bucket_id = 'avatars' AND (storage.foldername(name))[1] = user_id::text
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN avatar_url;
END;
$$ LANGUAGE plpgsql;