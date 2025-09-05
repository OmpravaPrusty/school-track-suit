-- Create the ENUM type for subjects
CREATE TYPE subject_enum AS ENUM ('English', 'Math', 'BIO', 'PHY', 'CHEM', 'AI', 'CS');

-- Create sme_subjects table
CREATE TABLE sme_subjects (
    sme_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject subject_enum NOT NULL,
    PRIMARY KEY (sme_id, subject)
);

-- Create sme_batches table
CREATE TABLE sme_batches (
    sme_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    PRIMARY KEY (sme_id, batch_id)
);

-- Create assessments table
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sme_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    subject subject_enum NOT NULL,
    marks INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments to the tables and columns for clarity
COMMENT ON TABLE sme_subjects IS 'Stores the specialized subjects for each SME.';
COMMENT ON TABLE sme_batches IS 'Maps SMEs to the batches they are assigned to.';
COMMENT ON TABLE assessments IS 'Stores marks given by SMEs to students for various subjects.';

COMMENT ON COLUMN sme_subjects.sme_id IS 'Foreign key to the user profile of the SME.';
COMMENT ON COLUMN sme_subjects.subject IS 'The subject the SME specializes in.';

COMMENT ON COLUMN sme_batches.sme_id IS 'Foreign key to the user profile of the SME.';
COMMENT ON COLUMN sme_batches.batch_id IS 'Foreign key to the batch the SME is assigned to.';

COMMENT ON COLUMN assessments.student_id IS 'Foreign key to the user profile of the student being assessed.';
COMMENT ON COLUMN assessments.sme_id IS 'Foreign key to the user profile of the SME who conducted the assessment.';
COMMENT ON COLUMN assessments.batch_id IS 'Foreign key to the batch the assessment belongs to.';
COMMENT ON COLUMN assessments.subject IS 'The subject of the assessment.';
COMMENT ON COLUMN assessments.marks IS 'The marks awarded in the assessment.';
COMMENT ON COLUMN assessments.created_at IS 'The timestamp when the assessment was recorded.';
