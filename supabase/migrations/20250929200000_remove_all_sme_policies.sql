-- Remove all existing SME-related RLS policies manually
-- Run this to clean slate before adding the correct ones

-- Remove policies from students table
DROP POLICY IF EXISTS "SMEs can view students" ON public.students;
DROP POLICY IF EXISTS "SMEs can view students in assigned batches" ON public.students;
DROP POLICY IF EXISTS "SMEs can access students in their batches" ON public.students;

-- Remove policies from profiles table  
DROP POLICY IF EXISTS "SMEs can view student profiles" ON public.profiles;
DROP POLICY IF EXISTS "SMEs can view student profiles for assessment" ON public.profiles;

-- Remove policies from sme_batches table
DROP POLICY IF EXISTS "SMEs can view their batch assignments" ON public.sme_batches;
DROP POLICY IF EXISTS "Admins can manage sme batch assignments" ON public.sme_batches;

-- Remove policies from sme_subjects table
DROP POLICY IF EXISTS "SMEs can view their subject assignments" ON public.sme_subjects;  
DROP POLICY IF EXISTS "Admins can manage sme subject assignments" ON public.sme_subjects;

-- Remove policies from assessments table (SME-related)
DROP POLICY IF EXISTS "SMEs can manage assessments" ON public.assessments;
DROP POLICY IF EXISTS "SMEs can view assessments" ON public.assessments;
DROP POLICY IF EXISTS "SMEs can create assessments" ON public.assessments;
DROP POLICY IF EXISTS "SMEs can update assessments" ON public.assessments;