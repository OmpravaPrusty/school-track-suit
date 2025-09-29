-- Add RLS policies for SME access to their assignments
-- This is needed for the batch and subject dropdowns to work

-- Enable RLS on the tables if not already enabled
ALTER TABLE public.sme_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sme_subjects ENABLE ROW LEVEL SECURITY;

-- SME batches policies
DROP POLICY IF EXISTS "SMEs can view their batch assignments" ON public.sme_batches;
CREATE POLICY "SMEs can view their batch assignments" ON public.sme_batches
FOR SELECT TO authenticated 
USING (
  has_role(auth.uid(), 'sme'::app_role) AND 
  sme_id = auth.uid()
);

-- Admin can manage all SME batch assignments
DROP POLICY IF EXISTS "Admins can manage sme batch assignments" ON public.sme_batches;
CREATE POLICY "Admins can manage sme batch assignments" ON public.sme_batches
FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- SME subjects policies  
DROP POLICY IF EXISTS "SMEs can view their subject assignments" ON public.sme_subjects;
CREATE POLICY "SMEs can view their subject assignments" ON public.sme_subjects
FOR SELECT TO authenticated 
USING (
  has_role(auth.uid(), 'sme'::app_role) AND 
  sme_id = auth.uid()
);

-- Admin can manage all SME subject assignments
DROP POLICY IF EXISTS "Admins can manage sme subject assignments" ON public.sme_subjects;
CREATE POLICY "Admins can manage sme subject assignments" ON public.sme_subjects
FOR ALL TO authenticated 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));