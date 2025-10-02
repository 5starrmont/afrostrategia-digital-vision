-- Add thumbnail_url to reports table for displaying images in general content section
ALTER TABLE public.reports 
ADD COLUMN thumbnail_url TEXT;