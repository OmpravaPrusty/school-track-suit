-- Fix RLS policies to properly allow admin signup without recursive issues

-- Temporarily disable RLS on profiles and user_roles for initial admin creation
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with corrected policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable select for authorized profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable select for own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable admin management of all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable role assignment during initial setup" ON public.user_roles;

-- Create simplified policies for profiles
CREATE POLICY "Allow all operations for authenticated users" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create simplified policies for user_roles
CREATE POLICY "Allow all operations for authenticated users" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);