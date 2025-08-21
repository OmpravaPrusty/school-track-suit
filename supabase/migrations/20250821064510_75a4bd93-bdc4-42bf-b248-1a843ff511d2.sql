-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a function to check if user can view a specific profile
CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      -- Users can always view their own profile
      WHEN _profile_id = auth.uid() THEN true
      
      -- Admins can view all profiles
      WHEN public.has_role(auth.uid(), 'admin') THEN true
      
      -- School admins can view profiles from their school
      WHEN public.has_role(auth.uid(), 'school_admin') AND EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.id = _profile_id 
        AND s.school_id = public.get_user_school_id(auth.uid())
        
        UNION
        
        SELECT 1 FROM public.teachers t 
        WHERE t.id = _profile_id 
        AND t.school_id = public.get_user_school_id(auth.uid())
      ) THEN true
      
      -- Teachers can view students from their school
      WHEN public.has_role(auth.uid(), 'teacher') AND EXISTS (
        SELECT 1 FROM public.students s 
        WHERE s.id = _profile_id 
        AND s.school_id = public.get_user_school_id(auth.uid())
      ) THEN true
      
      -- SMEs can view all teachers and students
      WHEN public.has_role(auth.uid(), 'sme') AND EXISTS (
        SELECT 1 FROM public.students WHERE id = _profile_id
        UNION
        SELECT 1 FROM public.teachers WHERE id = _profile_id
      ) THEN true
      
      ELSE false
    END;
$$;

-- Create new restrictive policy for viewing profiles
CREATE POLICY "Users can view authorized profiles only" 
ON public.profiles 
FOR SELECT 
USING (public.can_view_profile(id));

-- Update the insert policy to ensure users can only create their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Ensure update policy is also secure (users can only update their own profile)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);