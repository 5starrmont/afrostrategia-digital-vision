-- Phase 1: Critical Security Fixes

-- 1. Remove public profile exposure - Replace overly permissive profile policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Add authenticated-only profile viewing with privacy controls
CREATE POLICY "Users can view their own profile and admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Fix Function Security Issues - Add secure search paths
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Secure Report Access - Replace overly permissive report policy
DROP POLICY IF EXISTS "Authenticated users can view all reports" ON public.reports;

-- Add role-based report access with sensitivity levels
CREATE POLICY "Role-based report access" 
ON public.reports 
FOR SELECT 
USING (
  -- Public reports are viewable by anyone
  public = true OR
  -- Authenticated users can view non-sensitive reports
  (auth.uid() IS NOT NULL AND (description IS NULL OR description NOT ILIKE '%confidential%' AND description NOT ILIKE '%internal%')) OR
  -- Admins and moderators can view all reports
  (auth.uid() IS NOT NULL AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)))
);

-- 4. Add audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Add report sensitivity classification
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS sensitivity_level text DEFAULT 'public' CHECK (sensitivity_level IN ('public', 'internal', 'confidential'));

-- Update existing reports to have proper sensitivity levels
UPDATE public.reports 
SET sensitivity_level = CASE 
  WHEN public = true THEN 'public'
  WHEN description ILIKE '%confidential%' THEN 'confidential'
  WHEN description ILIKE '%internal%' THEN 'internal'
  ELSE 'internal'
END
WHERE sensitivity_level = 'public';

-- 6. Improve report policy with sensitivity levels
DROP POLICY IF EXISTS "Role-based report access" ON public.reports;

CREATE POLICY "Sensitivity-based report access" 
ON public.reports 
FOR SELECT 
USING (
  -- Public reports are viewable by anyone
  (sensitivity_level = 'public') OR
  -- Internal reports require authentication
  (sensitivity_level = 'internal' AND auth.uid() IS NOT NULL) OR
  -- Confidential reports require admin/moderator role
  (sensitivity_level = 'confidential' AND auth.uid() IS NOT NULL AND 
   (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)))
);

-- 7. Add file validation columns to content and reports
ALTER TABLE public.content 
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS file_type text,
ADD COLUMN IF NOT EXISTS virus_scan_status text DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error'));

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS file_type text,
ADD COLUMN IF NOT EXISTS virus_scan_status text DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error'));

-- 8. Create admin assignment for existing user (assuming user exists)
-- This will need to be run manually for the specific admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'ianobwoge@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;