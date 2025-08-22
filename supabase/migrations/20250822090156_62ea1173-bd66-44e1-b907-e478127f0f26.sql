-- Fix RLS policies for student creation
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;
DROP POLICY IF EXISTS "School admins can manage their school students" ON public.students;

-- Create more permissive policies for creation
CREATE POLICY "Admins can manage all students" 
ON public.students 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "School admins can manage their school students" 
ON public.students 
FOR ALL 
USING (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND (school_id = get_user_school_id(auth.uid()) OR auth.uid() = id)
)
WITH CHECK (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school_id(auth.uid())
);

-- Also ensure the profiles table has proper policies for user creation
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.profiles;

CREATE POLICY "Users can manage own profile" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));