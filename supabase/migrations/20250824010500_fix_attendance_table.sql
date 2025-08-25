-- Drop the dependent RLS policy first
DROP POLICY IF EXISTS "Teachers can manage attendance for their sessions" ON public.attendance;

-- Drop the existing foreign key constraint on session_id
ALTER TABLE public.attendance
DROP CONSTRAINT IF EXISTS attendance_session_id_fkey;

-- Drop the session_id column as it's not used in the current workflow
ALTER TABLE public.attendance
DROP COLUMN IF EXISTS session_id;

-- Add a date column to store the attendance date
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS attendance_date DATE;

-- Drop the old unique constraint that included session_id
-- The name of the constraint is session_id_student_id_key as seen in the initial migration
ALTER TABLE public.attendance
DROP CONSTRAINT IF EXISTS session_id_student_id_key;

-- Add a new unique constraint on student_id and the new date column
ALTER TABLE public.attendance
ADD CONSTRAINT attendance_student_id_attendance_date_key UNIQUE (student_id, attendance_date);
