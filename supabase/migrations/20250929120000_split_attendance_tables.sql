-- Split attendance table into separate student_attendance and sme_attendance tables
-- Migration: 20250929120000_split_attendance_tables.sql

-- First, create the new student_attendance table
CREATE TABLE public.student_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status public.attendance_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint for student attendance per day
ALTER TABLE public.student_attendance
ADD CONSTRAINT student_attendance_student_id_attendance_date_key UNIQUE (student_id, attendance_date);

-- Create index for better query performance
CREATE INDEX idx_student_attendance_date ON public.student_attendance (attendance_date);
CREATE INDEX idx_student_attendance_status ON public.student_attendance (status);

-- Second, create the new sme_attendance table
CREATE TABLE public.sme_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sme_id UUID NOT NULL REFERENCES public.smes(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status public.attendance_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint for SME attendance per day
ALTER TABLE public.sme_attendance
ADD CONSTRAINT sme_attendance_sme_id_attendance_date_key UNIQUE (sme_id, attendance_date);

-- Create index for better query performance
CREATE INDEX idx_sme_attendance_date ON public.sme_attendance (attendance_date);
CREATE INDEX idx_sme_attendance_status ON public.sme_attendance (status);

-- Migrate existing student attendance data
INSERT INTO public.student_attendance (
    student_id,
    attendance_date,
    status,
    notes,
    created_at
)
SELECT 
    student_id,
    attendance_date,
    status,
    notes,
    created_at
FROM public.attendance
WHERE student_id IS NOT NULL;

-- Migrate existing SME attendance data
INSERT INTO public.sme_attendance (
    sme_id,
    attendance_date,
    status,
    notes,
    created_at
)
SELECT 
    sme_id,
    attendance_date,
    status,
    notes,
    created_at
FROM public.attendance
WHERE sme_id IS NOT NULL;

-- Verify data migration (optional check - can be removed in production)
-- This will show the count comparison
DO $$
DECLARE
    old_student_count INTEGER;
    old_sme_count INTEGER;
    new_student_count INTEGER;
    new_sme_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO old_student_count FROM public.attendance WHERE student_id IS NOT NULL;
    SELECT COUNT(*) INTO old_sme_count FROM public.attendance WHERE sme_id IS NOT NULL;
    SELECT COUNT(*) INTO new_student_count FROM public.student_attendance;
    SELECT COUNT(*) INTO new_sme_count FROM public.sme_attendance;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE 'Old student records: %, New student records: %', old_student_count, new_student_count;
    RAISE NOTICE 'Old SME records: %, New SME records: %', old_sme_count, new_sme_count;
    
    IF old_student_count != new_student_count THEN
        RAISE EXCEPTION 'Student attendance migration failed: expected %, got %', old_student_count, new_student_count;
    END IF;
    
    IF old_sme_count != new_sme_count THEN
        RAISE EXCEPTION 'SME attendance migration failed: expected %, got %', old_sme_count, new_sme_count;
    END IF;
    
    RAISE NOTICE 'Data migration completed successfully!';
END $$;

-- Drop the old attendance table constraints and indexes first
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance for their sessions" ON public.attendance;
DROP POLICY IF EXISTS "SMEs can manage their own attendance" ON public.attendance;

-- Drop the old attendance table
DROP TABLE IF EXISTS public.attendance CASCADE;

-- Enable RLS on new tables
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sme_attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_attendance
CREATE POLICY "Students can view their own attendance"
ON public.student_attendance
FOR SELECT
TO authenticated
USING (
    student_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'teacher', 'school_admin')
    )
);

CREATE POLICY "Admins and teachers can manage student attendance"
ON public.student_attendance
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'teacher', 'school_admin')
    )
);

-- Create RLS policies for sme_attendance
CREATE POLICY "SMEs can view their own attendance"
ON public.sme_attendance
FOR SELECT
TO authenticated
USING (
    sme_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'school_admin')
    )
);

CREATE POLICY "SMEs can manage their own attendance"
ON public.sme_attendance
FOR INSERT
TO authenticated
WITH CHECK (
    sme_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'school_admin')
    )
);

CREATE POLICY "SMEs can update their own attendance"
ON public.sme_attendance
FOR UPDATE
TO authenticated
USING (
    sme_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'school_admin')
    )
);

CREATE POLICY "Admins can manage all SME attendance"
ON public.sme_attendance
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'school_admin')
    )
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER student_attendance_updated_at
    BEFORE UPDATE ON public.student_attendance
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER sme_attendance_updated_at
    BEFORE UPDATE ON public.sme_attendance
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add comments to document the new tables
COMMENT ON TABLE public.student_attendance IS 'Stores daily attendance records for students';
COMMENT ON TABLE public.sme_attendance IS 'Stores daily attendance records for Subject Matter Experts (SMEs)';

COMMENT ON COLUMN public.student_attendance.student_id IS 'References the student from students table';
COMMENT ON COLUMN public.student_attendance.attendance_date IS 'Date of attendance record';
COMMENT ON COLUMN public.student_attendance.status IS 'Attendance status: present, absent, late, not_applicable';

COMMENT ON COLUMN public.sme_attendance.sme_id IS 'References the SME from smes table';
COMMENT ON COLUMN public.sme_attendance.attendance_date IS 'Date of attendance record';
COMMENT ON COLUMN public.sme_attendance.status IS 'Attendance status: present, absent, late, not_applicable';