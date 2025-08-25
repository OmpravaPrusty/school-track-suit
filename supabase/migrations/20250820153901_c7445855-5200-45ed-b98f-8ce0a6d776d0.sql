-- Create enum types for roles and statuses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'student', 'teacher', 'sme', 'school_admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'suspended');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
        CREATE TYPE public.session_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late');
    END IF;
END$$;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    status public.user_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table  
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Create organizations table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schools table
CREATE TABLE public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE,
    duration_weeks INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create batches table
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    max_students INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    student_id TEXT UNIQUE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    graduation_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create teachers table
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE,
    specialization TEXT,
    hire_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create SMEs table
CREATE TABLE public.smes (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    experience_years INTEGER,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    sme_id UUID REFERENCES public.smes(id) ON DELETE SET NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    meeting_link TEXT,
    status public.session_status DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    status public.attendance_status NOT NULL,
    check_in_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_id, student_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create course assignments table (for SME-Student/Teacher assignments)
CREATE TABLE public.course_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignee_type TEXT NOT NULL CHECK (assignee_type IN ('student', 'teacher')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (course_id, assignee_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(s.school_id, t.school_id)
  FROM public.profiles p
  LEFT JOIN public.students s ON s.id = p.id
  LEFT JOIN public.teachers t ON t.id = p.id
  WHERE p.id = _user_id
$$;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Organizations policies
CREATE POLICY "Admins can manage organizations" ON public.organizations
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view organizations" ON public.organizations
FOR SELECT TO authenticated USING (true);

-- Schools policies
CREATE POLICY "Admins can manage all schools" ON public.schools
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "School admins can manage their school" ON public.schools
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'school_admin') AND 
  id = public.get_user_school_id(auth.uid())
);

CREATE POLICY "All authenticated users can view schools" ON public.schools
FOR SELECT TO authenticated USING (true);

-- Courses policies
CREATE POLICY "Admins and SMEs can manage courses" ON public.courses
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'sme')
);

CREATE POLICY "All authenticated users can view courses" ON public.courses
FOR SELECT TO authenticated USING (true);

-- Batches policies
CREATE POLICY "Admins can manage all batches" ON public.batches
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "School admins can manage their school batches" ON public.batches
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'school_admin') AND 
  school_id = public.get_user_school_id(auth.uid())
);

CREATE POLICY "All authenticated users can view batches" ON public.batches
FOR SELECT TO authenticated USING (true);

-- Students policies
CREATE POLICY "Admins can manage all students" ON public.students
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "School admins can manage their school students" ON public.students
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'school_admin') AND 
  school_id = public.get_user_school_id(auth.uid())
);

CREATE POLICY "Teachers can view their school students" ON public.students
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'teacher') AND 
  school_id = public.get_user_school_id(auth.uid())
);

CREATE POLICY "Students can view own record" ON public.students
FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "SMEs can view students" ON public.students
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'sme'));

-- Teachers policies
CREATE POLICY "Admins can manage all teachers" ON public.teachers
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "School admins can manage their school teachers" ON public.teachers
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'school_admin') AND 
  school_id = public.get_user_school_id(auth.uid())
);

CREATE POLICY "All authenticated users can view teachers" ON public.teachers
FOR SELECT TO authenticated USING (true);

-- SMEs policies
CREATE POLICY "Admins can manage SMEs" ON public.smes
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SMEs can update own record" ON public.smes
FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "All authenticated users can view SMEs" ON public.smes
FOR SELECT TO authenticated USING (true);

-- Sessions policies
CREATE POLICY "Admins can manage all sessions" ON public.sessions
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SMEs can manage their sessions" ON public.sessions
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'sme') AND sme_id = auth.uid()
);

CREATE POLICY "Teachers can manage their sessions" ON public.sessions
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'teacher') AND teacher_id = auth.uid()
);

CREATE POLICY "All authenticated users can view sessions" ON public.sessions
FOR SELECT TO authenticated USING (true);

-- Attendance policies
CREATE POLICY "Admins can manage all attendance" ON public.attendance
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage attendance for their sessions" ON public.attendance
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'teacher') AND 
  EXISTS (
    SELECT 1 FROM public.sessions s 
    WHERE s.id = session_id AND s.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view own attendance" ON public.attendance
FOR SELECT TO authenticated USING (student_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON public.notifications
FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can create notifications for anyone" ON public.notifications
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Course assignments policies
CREATE POLICY "Admins can manage all course assignments" ON public.course_assignments
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SMEs can manage course assignments" ON public.course_assignments
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'sme') AND assigner_id = auth.uid()
);

CREATE POLICY "Users can view their assignments" ON public.course_assignments
FOR SELECT TO authenticated USING (assignee_id = auth.uid());

-- Create trigger for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_batches_updated_at
    BEFORE UPDATE ON public.batches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON public.teachers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smes_updated_at
    BEFORE UPDATE ON public.smes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();