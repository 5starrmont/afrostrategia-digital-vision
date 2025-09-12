-- Make the admin-uploads bucket public for published content
UPDATE storage.buckets 
SET public = true 
WHERE id = 'admin-uploads';

-- Create RLS policies for public access to files
CREATE POLICY "Allow public access to published content files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'admin-uploads' 
  AND EXISTS (
    SELECT 1 FROM public.content 
    WHERE content.file_url LIKE '%' || name || '%' 
    AND content.published = true
  )
);

-- Also allow public access to all files in admin-uploads for now
CREATE POLICY "Public access to admin uploads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'admin-uploads');