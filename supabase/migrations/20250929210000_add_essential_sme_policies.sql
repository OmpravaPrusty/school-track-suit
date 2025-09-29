-- Essential RLS policies for SME functionality
-- Add these after removing the old policies

-- Enable RLS on tables that need it
ALTER TABLE public.sme_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sme_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- 1. SME_BATCHES - SMEs need to see their batch assignments (for dropdown)
CREATE POLICY "SMEs can view their assigned batches" ON public.sme_batches
FOR SELECT TO authenticated 
USING (sme_id = auth.uid());

-- 2. SME_SUBJECTS - SMEs need to see their subject assignments (for dropdown)  
CREATE POLICY "SMEs can view their assigned subjects" ON public.sme_subjects
FOR SELECT TO authenticated 
USING (sme_id = auth.uid());

-- 3. STUDENTS - SMEs need to see students in their assigned batches
CREATE POLICY "SMEs can view students in their batches" ON public.students
FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM sme_batches sb 
    WHERE sb.sme_id = auth.uid() 
    AND sb.batch_id = students.batch_id
  )
);

-- 4. PROFILES - SMEs need to see profiles of students they assess
CREATE POLICY "SMEs can view student profiles" ON public.profiles
FOR SELECT TO authenticated 
USING (
  has_role(auth.uid(), 'sme'::app_role) AND (
    id = auth.uid() OR -- SME can see their own profile
    EXISTS (
      SELECT 1 FROM students s, sme_batches sb 
      WHERE s.id = profiles.id 
      AND sb.sme_id = auth.uid() 
      AND sb.batch_id = s.batch_id
    )
  )
);

-- 5. ASSESSMENTS - SMEs need to manage their assessments
CREATE POLICY "SMEs can manage their assessments" ON public.assessments
FOR ALL TO authenticated 
USING (sme_id = auth.uid())
WITH CHECK (sme_id = auth.uid());

-- Admin policies (so admins can manage everything)
CREATE POLICY "Admins can manage all sme_batches" ON public.sme_batches
FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all sme_subjects" ON public.sme_subjects  
FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));