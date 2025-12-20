-- Create careers/opportunities table
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('job', 'internship', 'attachment')),
  department_id UUID REFERENCES public.departments(id),
  location TEXT,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'remote')),
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  application_deadline TIMESTAMP WITH TIME ZONE,
  application_email TEXT,
  application_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Public can view active opportunities
CREATE POLICY "Anyone can view active opportunities"
ON public.opportunities
FOR SELECT
USING (is_active = true);

-- Admins and moderators can manage opportunities
CREATE POLICY "Admins and moderators can manage opportunities"
ON public.opportunities
FOR ALL
USING (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'moderator'::app_role)
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;