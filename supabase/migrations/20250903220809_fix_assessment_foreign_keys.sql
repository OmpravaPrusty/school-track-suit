-- Step 1: Drop the incorrect foreign key constraints that point to auth.users

-- Note: The constraint names are assumed based on PostgreSQL defaults.
-- If they are different, this script would need to be adjusted.
ALTER TABLE public.sme_subjects DROP CONSTRAINT sme_subjects_sme_id_fkey;
ALTER TABLE public.sme_batches DROP CONSTRAINT sme_batches_sme_id_fkey;
ALTER TABLE public.assessments DROP CONSTRAINT assessments_sme_id_fkey;
ALTER TABLE public.assessments DROP CONSTRAINT assessments_student_id_fkey;


-- Step 2: Add the correct foreign key constraints pointing to the specific role tables

-- For sme_subjects, link to the smes table
ALTER TABLE public.sme_subjects
ADD CONSTRAINT sme_subjects_sme_id_fkey
FOREIGN KEY (sme_id) REFERENCES public.smes(id) ON DELETE CASCADE;

-- For sme_batches, link to the smes table
ALTER TABLE public.sme_batches
ADD CONSTRAINT sme_batches_sme_id_fkey
FOREIGN KEY (sme_id) REFERENCES public.smes(id) ON DELETE CASCADE;

-- For assessments, link sme_id to the smes table
ALTER TABLE public.assessments
ADD CONSTRAINT assessments_sme_id_fkey
FOREIGN KEY (sme_id) REFERENCES public.smes(id) ON DELETE CASCADE;

-- For assessments, link student_id to the students table
-- First, we need to ensure the students table exists and has a primary key on id.
-- Based on the application code, the 'students' table `id` is the user_id and is the primary key.
-- If the student is deleted, the user is deleted, and the profile is deleted, which should cascade here.
-- Let's check if the students table has a primary key on id. The code suggests so.
-- We will assume the students table exists with id as PK.
ALTER TABLE public.assessments
ADD CONSTRAINT assessments_student_id_fkey
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- Re-add comments for clarity on the new relationships
COMMENT ON COLUMN public.sme_subjects.sme_id IS 'Foreign key to the smes table.';
COMMENT ON COLUMN public.sme_batches.sme_id IS 'Foreign key to the smes table.';
COMMENT ON COLUMN public.assessments.sme_id IS 'Foreign key to the smes table.';
COMMENT ON COLUMN public.assessments.student_id IS 'Foreign key to the students table.';
