-- Ensure SMEs can access students they need to assess
-- This might have been dropped in a previous migration

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "SMEs can view students" ON public.students;
DROP POLICY IF EXISTS "SMEs can access students in their batches" ON public.students;

-- Create a comprehensive policy for SMEs to access students
CREATE POLICY "SMEs can view students in assigned batches" ON public.students
FOR SELECT TO authenticated 
USING (
  has_role(auth.uid(), 'sme'::app_role) AND 
  batch_id IN (
    SELECT batch_id 
    FROM sme_batches 
    WHERE sme_id = auth.uid()
  )
);

-- Also ensure SMEs can view profiles of students they assess
DROP POLICY IF EXISTS "SMEs can view student profiles" ON public.profiles;

CREATE POLICY "SMEs can view student profiles for assessment" ON public.profiles
FOR SELECT TO authenticated 
USING (
  has_role(auth.uid(), 'sme'::app_role) AND 
  id IN (
    SELECT s.id 
    FROM students s 
    JOIN sme_batches sb ON s.batch_id = sb.batch_id 
    WHERE sb.sme_id = auth.uid()
  )
);