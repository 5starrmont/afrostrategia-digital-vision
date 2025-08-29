-- Update the existing function to fix the search path security issue
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Create an admin dashboard stats function for security insights
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_content BIGINT,
  total_reports BIGINT,
  published_content BIGINT,
  public_reports BIGINT,
  recent_uploads BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.content) as total_content,
    (SELECT COUNT(*) FROM public.reports) as total_reports,
    (SELECT COUNT(*) FROM public.content WHERE published = true) as published_content,
    (SELECT COUNT(*) FROM public.reports WHERE public = true) as public_reports,
    (SELECT COUNT(*) FROM public.content WHERE created_at > NOW() - INTERVAL '7 days') as recent_uploads;
$function$;

-- Add enhanced audit logging trigger function
CREATE OR REPLACE FUNCTION public.log_content_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.published != NEW.published THEN
      INSERT INTO public.audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values
      ) VALUES (
        auth.uid(),
        'content_status_change',
        'content',
        NEW.id,
        jsonb_build_object('published', OLD.published),
        jsonb_build_object('published', NEW.published)
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create the trigger for content changes
DROP TRIGGER IF EXISTS log_content_changes_trigger ON public.content;
CREATE TRIGGER log_content_changes_trigger
  AFTER UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.log_content_changes();

-- Add IP address logging capability to user sessions
CREATE OR REPLACE FUNCTION public.log_admin_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log admin logins for security monitoring
  IF NEW.role IN ('admin', 'moderator') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      new_values
    ) VALUES (
      NEW.user_id,
      'admin_role_assigned',
      'user_roles',
      NEW.id,
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for role assignments
DROP TRIGGER IF EXISTS log_admin_login_trigger ON public.user_roles;
CREATE TRIGGER log_admin_login_trigger
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_login();