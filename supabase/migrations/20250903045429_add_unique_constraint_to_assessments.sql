ALTER TABLE public.assessments
ADD CONSTRAINT assessments_student_sme_batch_subject_unique UNIQUE (student_id, sme_id, batch_id, subject);
