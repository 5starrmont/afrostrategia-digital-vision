-- Add public field to reports table for controlling public visibility
ALTER TABLE public.reports 
ADD COLUMN public boolean NOT NULL DEFAULT false;

-- Update the RLS policy to only show public reports to unauthenticated users
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;

-- Create new policy that only allows viewing of public reports for unauthenticated users
CREATE POLICY "Public can view public reports" 
ON public.reports 
FOR SELECT 
USING (public = true);

-- Authenticated users can view all reports (existing functionality preserved)
CREATE POLICY "Authenticated users can view all reports" 
ON public.reports 
FOR SELECT 
TO authenticated
USING (true);