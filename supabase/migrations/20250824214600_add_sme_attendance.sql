-- -- Add the sme_id column to the attendance table, allowing it to be null
-- ALTER TABLE public.attendance
-- ADD COLUMN sme_id UUID REFERENCES public.smes(id) ON DELETE CASCADE;

-- -- Add a check constraint to ensure that either student_id or sme_id is populated, but not both
-- ALTER TABLE public.attendance
-- ADD CONSTRAINT student_or_sme_check CHECK (
--   (student_id IS NOT NULL AND sme_id IS NULL) OR
--   (student_id IS NULL AND sme_id IS NOT NULL)
-- );

-- -- Create a unique index for student attendance per day
-- CREATE UNIQUE INDEX unique_student_attendance_per_day
-- ON public.attendance (attendance_date, student_id)
-- WHERE student_id IS NOT NULL;

-- -- Create a unique index for SME attendance per day
-- CREATE UNIQUE INDEX unique_sme_attendance_per_day
-- ON public.attendance (attendance_date, sme_id)
-- WHERE sme_id IS NOT NULL;
