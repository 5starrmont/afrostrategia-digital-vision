-- Add author column to reports table
ALTER TABLE public.reports 
ADD COLUMN author text DEFAULT 'AfroStrategia';