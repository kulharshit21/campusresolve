-- ==============================================================================
-- CampusResolve: Smart Campus Complaint & Issue Management System
-- Initial Migration: Schema, Triggers, Functions, Indexes, and RLS Policies
-- ==============================================================================

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Protect role modification from client updates
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role AND (SELECT current_setting('role', true)) <> 'service_role' THEN
    -- Prevent unauthorized role self-elevation
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Only authorized administrators can alter user roles.';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- Trigger to automatically create profile on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN (
      'Wi-Fi / Network',
      'Electrical',
      'Hostel',
      'Classroom',
      'Cleanliness',
      'Water / Plumbing',
      'Library',
      'Other'
    )
  ),
  campus_location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  image_url TEXT,
  resolution_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Comments Table
CREATE TABLE IF NOT EXISTS public.complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Status History & Audit Trail Table
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to record status transitions automatically
CREATE OR REPLACE FUNCTION public.log_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.complaint_status_history (complaint_id, changed_by, old_status, new_status, note)
    VALUES (NEW.id, NEW.student_id, NULL, NEW.status, 'Complaint registered by student');
  ELSIF (TG_OP = 'UPDATE' AND OLD.status <> NEW.status) THEN
    INSERT INTO public.complaint_status_history (complaint_id, changed_by, old_status, new_status, note)
    VALUES (NEW.id, auth.uid(), OLD.status, NEW.status, COALESCE(NEW.resolution_note, 'Status changed by administrator'));
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_log_complaint_status_change
AFTER INSERT OR UPDATE ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.log_complaint_status_change();


-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_student_id ON public.complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_complaint_id ON public.complaint_comments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_history_complaint_id ON public.complaint_status_history(complaint_id);


-- 6. Helper Function to check if caller is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 7. Enable Row Level Security (RLS) on all exposed tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies: Profiles
CREATE POLICY "Profiles readable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile details"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 9. RLS Policies: Complaints
-- Students read their own, Admins read all
CREATE POLICY "Students see own complaints, Admins see all"
ON public.complaints FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() OR public.is_admin()
);

-- Students can create complaints for themselves
CREATE POLICY "Students can insert complaints"
ON public.complaints FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
);

-- Admins can update complaint status and notes
CREATE POLICY "Admins can update complaints"
ON public.complaints FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- 10. RLS Policies: Comments
CREATE POLICY "View comments for authorized complaints"
ON public.complaint_comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.complaints c
    WHERE c.id = complaint_comments.complaint_id
      AND (c.student_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Add comments to authorized complaints"
ON public.complaint_comments FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_comments.complaint_id
        AND (c.student_id = auth.uid() OR public.is_admin())
    )
  )
);

-- 11. RLS Policies: Status History
CREATE POLICY "View status history for authorized complaints"
ON public.complaint_status_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.complaints c
    WHERE c.id = complaint_status_history.complaint_id
      AND (c.student_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY "Insert status history authorized"
ON public.complaint_status_history FOR INSERT
TO authenticated
WITH CHECK (
  changed_by = auth.uid() OR public.is_admin()
);

-- 12. Enable Supabase Realtime Publication safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'complaints'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'complaint_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_comments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'complaint_status_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_status_history;
  END IF;
END $$;
