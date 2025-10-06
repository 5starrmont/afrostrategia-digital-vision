-- Create a function to assign roles by email address
CREATE OR REPLACE FUNCTION public.assign_role_by_email(
  user_email text,
  user_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  existing_role_id uuid;
BEGIN
  -- Find the user by email in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
  
  -- If user not found, return error
  IF target_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with that email address. They need to sign up first.'
    );
  END IF;
  
  -- Check if user already has a role
  SELECT id INTO existing_role_id
  FROM public.user_roles
  WHERE user_id = target_user_id;
  
  IF existing_role_id IS NOT NULL THEN
    -- Update existing role
    UPDATE public.user_roles
    SET role = user_role
    WHERE user_id = target_user_id;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'updated',
      'user_id', target_user_id,
      'role', user_role
    );
  ELSE
    -- Insert new role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, user_role);
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'created',
      'user_id', target_user_id,
      'role', user_role
    );
  END IF;
END;
$$;