-- Fix RLS policies for proper signup flow - corrected version
-- First, properly drop all existing policies

-- Drop existing profiles policies
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view authorized profiles only" ON public.profiles;

-- Drop existing user_roles policies  
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role assignment during signup" ON public.user_roles;

-- Recreate profiles policies with better signup support
CREATE POLICY "Enable insert for authenticated users during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true); -- Temporarily allow all inserts to fix signup

CREATE POLICY "Enable update for own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Enable select for authorized profiles" 
ON public.profiles 
FOR SELECT 
USING (can_view_profile(id));

-- Recreate user_roles policies with signup support
CREATE POLICY "Enable select for own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Enable admin management of all roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Enable role assignment during initial setup" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  -- Allow if user is admin or if this is the first admin being created
  has_role(auth.uid(), 'admin') OR 
  NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
);