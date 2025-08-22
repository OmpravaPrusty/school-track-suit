-- Remove the invalid auth.users insertion and fix the schema
-- Only create the sample data without touching auth tables

-- Remove any invalid auth.users entries that might have been created
-- (This is safe since we're only removing the specific test entry)

-- Create sample organization and school for testing
INSERT INTO public.organizations (
  id,
  name,
  address,
  contact_email,
  contact_phone
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Demo Education Board',
  '123 Education Street, Learning City',
  'contact@demoeducation.com',
  '+91-1234567890'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.schools (
  id,
  name,
  address,
  contact_email,
  contact_phone,
  organization_id
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Demo High School',
  '456 School Avenue, Learning City',
  'admin@demohighschool.com',
  '+91-2345678901',
  '11111111-1111-1111-1111-111111111111'::uuid
) ON CONFLICT (id) DO NOTHING;

-- Create sample courses
INSERT INTO public.courses (
  id,
  name,
  code,
  description,
  duration_weeks
) VALUES 
  ('c1111111-1111-1111-1111-111111111111'::uuid, 'Mathematics', 'MATH101', 'Basic Mathematics Course', 12),
  ('c2222222-2222-2222-2222-222222222222'::uuid, 'Physics', 'PHY101', 'Introduction to Physics', 12),
  ('c3333333-3333-3333-3333-333333333333'::uuid, 'Chemistry', 'CHEM101', 'Basic Chemistry', 12),
  ('c4444444-4444-4444-4444-444444444444'::uuid, 'Biology', 'BIO101', 'Life Sciences', 12),
  ('c5555555-5555-5555-5555-555555555555'::uuid, 'English', 'ENG101', 'English Language and Literature', 12)
ON CONFLICT (id) DO NOTHING;

-- Create sample batches
INSERT INTO public.batches (
  id,
  name,
  school_id,
  start_date,
  end_date,
  max_students
) VALUES 
  ('b1111111-1111-1111-1111-111111111111'::uuid, 'Class 12A', '22222222-2222-2222-2222-222222222222'::uuid, '2024-04-01', '2025-03-31', 30),
  ('b2222222-2222-2222-2222-222222222222'::uuid, 'Class 11B', '22222222-2222-2222-2222-222222222222'::uuid, '2024-04-01', '2025-03-31', 30),
  ('b3333333-3333-3333-3333-333333333333'::uuid, 'Class 10C', '22222222-2222-2222-2222-222222222222'::uuid, '2024-04-01', '2025-03-31', 30),
  ('b4444444-4444-4444-4444-444444444444'::uuid, 'Class 9D', '22222222-2222-2222-2222-222222222222'::uuid, '2024-04-01', '2025-03-31', 30)
ON CONFLICT (id) DO NOTHING;