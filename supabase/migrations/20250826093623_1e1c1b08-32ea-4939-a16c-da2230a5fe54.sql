-- Fix database structure issues
-- First, let's check if the profiles table needs a role column for users
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- Fix smes table - need to add profiles relationship
ALTER TABLE public.smes ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);

-- Fix teachers table - need to add profiles relationship  
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);

-- Fix students table - need to add profiles relationship
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);

-- Ensure attendance table has proper columns
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teachers(id);

-- Update RLS policies to work with the new structure
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profiles" ON public.profiles;

CREATE POLICY "Users can view their own profiles" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profiles" ON public.profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Update SME policies
DROP POLICY IF EXISTS "SMEs can be viewed by authenticated users" ON public.smes;
DROP POLICY IF EXISTS "SMEs can be created by admins" ON public.smes;
DROP POLICY IF EXISTS "SMEs can be updated by owners and admins" ON public.smes;

CREATE POLICY "Anyone can view SMEs" ON public.smes FOR SELECT USING (true);
CREATE POLICY "Admins can manage SMEs" ON public.smes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Update Teacher policies
DROP POLICY IF EXISTS "Teachers can be viewed by authenticated users" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can be created by admins" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can be updated by owners and admins" ON public.teachers;

CREATE POLICY "Anyone can view teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Admins can manage teachers" ON public.teachers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Update Student policies
DROP POLICY IF EXISTS "Students can be viewed by authenticated users" ON public.students;
DROP POLICY IF EXISTS "Students can be created by admins" ON public.students;
DROP POLICY IF EXISTS "Students can be updated by owners and admins" ON public.students;

CREATE POLICY "Anyone can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);