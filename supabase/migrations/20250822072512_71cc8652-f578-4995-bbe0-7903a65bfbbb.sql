-- -- Fix RLS policies for proper signup flow
-- -- The issue is that users can't insert profiles during signup because they're not yet considered authenticated

-- -- First, let's update the profiles RLS policy to allow insertion during signup
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- -- Create a more permissive insert policy that allows profile creation during signup
-- CREATE POLICY "Users can insert own profile during signup" 
-- ON public.profiles 
-- FOR INSERT 
-- WITH CHECK (
--   -- Allow insertion if the user ID matches the current auth user
--   -- or if it's being inserted by the handle_new_user trigger
--   auth.uid() = id OR auth.uid() IS NULL
-- );

-- -- Also update the user_roles policy to allow role assignment during signup
-- DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
-- DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- -- Recreate user_roles policies
-- CREATE POLICY "Users can view own roles" 
-- ON public.user_roles 
-- FOR SELECT 
-- USING (user_id = auth.uid());

-- CREATE POLICY "Admins can manage all roles" 
-- ON public.user_roles 
-- FOR ALL 
-- USING (has_role(auth.uid(), 'admin'));

-- -- Allow initial role assignment during signup
-- CREATE POLICY "Allow role assignment during signup" 
-- ON public.user_roles 
-- FOR INSERT 
-- WITH CHECK (
--   -- Allow if user is admin or during initial signup process
--   has_role(auth.uid(), 'admin') OR 
--   -- Allow if no roles exist yet (first admin creation)
--   NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
-- );

-- -- Ensure the handle_new_user trigger is properly set up
-- -- This trigger should automatically create a profile when a user signs up
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, full_name, phone)
--   VALUES (
--     NEW.id,
--     NEW.email,
--     COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
--     NEW.raw_user_meta_data ->> 'phone'
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;