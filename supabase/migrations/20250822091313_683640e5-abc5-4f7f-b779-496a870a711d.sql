-- Fix RLS policies for all user types (students, teachers, SMEs)

-- Update profiles policies to allow creation
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view and update own profile" 
ON public.profiles 
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix teachers table policies
DROP POLICY IF EXISTS "Admins can manage all teachers" ON public.teachers;
DROP POLICY IF EXISTS "School admins can manage their school teachers" ON public.teachers;

CREATE POLICY "Admins can manage all teachers" 
ON public.teachers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "School admins can manage their school teachers" 
ON public.teachers 
FOR ALL 
USING (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'school_admin'::app_role) 
  AND school_id = get_user_school_id(auth.uid())
);

-- Fix SMEs table policies
DROP POLICY IF EXISTS "Admins can manage SMEs" ON public.smes;
DROP POLICY IF EXISTS "SMEs can update own record" ON public.smes;

CREATE POLICY "Admins can manage SMEs" 
ON public.smes 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "SMEs can update own record" 
ON public.smes 
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());