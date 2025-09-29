-- Add department and employee_id columns to the smes table
ALTER TABLE public.smes 
ADD COLUMN department VARCHAR(100),
ADD COLUMN employee_id VARCHAR(50);

-- Add a unique constraint on employee_id to prevent duplicates
ALTER TABLE public.smes 
ADD CONSTRAINT unique_employee_id UNIQUE (employee_id);

-- Add indexes for better query performance
CREATE INDEX idx_smes_department ON public.smes (department);
CREATE INDEX idx_smes_employee_id ON public.smes (employee_id);

-- Add comments for documentation
COMMENT ON COLUMN public.smes.department IS 'Department or division the SME belongs to';
COMMENT ON COLUMN public.smes.employee_id IS 'Unique employee identifier for the SME';
