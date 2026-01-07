-- Add gallery_images column to content table for multiple blog images
ALTER TABLE public.content 
ADD COLUMN gallery_images text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.content.gallery_images IS 'Array of image URLs for blog post gallery';