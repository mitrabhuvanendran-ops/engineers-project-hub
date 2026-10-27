-- ==============================================================================
-- ENGINEER'S PROJECT HUB - DATABASE SCHEMA & SECURITY POLICIES
-- ==============================================================================
-- Execute this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It will create all necessary tables, triggers, indexes, and Row Level Security (RLS) policies.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. User Profiles Table (Auto-synced with Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. Projects Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN (
    'Robotics', 'Mechanical', 'Electronics', 'Software', 
    'Civil', 'Chemical', 'Electrical', 'Biomedical', 'Aerospace', 'Other'
  )),
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. Engineering Notes Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  tag TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. Engineering Calculations Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  formula TEXT DEFAULT '',
  inputs TEXT DEFAULT '',
  result TEXT DEFAULT '',
  unit TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. Project Files Metadata Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  size BIGINT DEFAULT 0,
  type TEXT DEFAULT '',
  file_path TEXT NOT NULL,
  public_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. Indexes for High Performance Querying
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_notes_project_id ON public.notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_project_id ON public.calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON public.calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_user_id ON public.project_files(user_id);

-- ------------------------------------------------------------------------------
-- 8. Row Level Security (RLS) - Strict User Isolation
-- ------------------------------------------------------------------------------
-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Projects Policies
CREATE POLICY "Users can view their own projects" 
  ON public.projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.projects FOR DELETE 
  USING (auth.uid() = user_id);

-- Notes Policies
CREATE POLICY "Users can view notes of their projects" 
  ON public.notes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notes to their projects" 
  ON public.notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON public.notes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON public.notes FOR DELETE 
  USING (auth.uid() = user_id);

-- Calculations Policies
CREATE POLICY "Users can view calculations of their projects" 
  ON public.calculations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert calculations to their projects" 
  ON public.calculations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations" 
  ON public.calculations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations" 
  ON public.calculations FOR DELETE 
  USING (auth.uid() = user_id);

-- Project Files Policies
CREATE POLICY "Users can view files of their projects" 
  ON public.project_files FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert file records to their projects" 
  ON public.project_files FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file records" 
  ON public.project_files FOR DELETE 
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. Automatic Updated_At Timestamp Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_notes_updated_at ON public.notes;
CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_calculations_updated_at ON public.calculations;
CREATE TRIGGER set_calculations_updated_at
  BEFORE UPDATE ON public.calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 10. Automatically Create User Profile on Sign Up
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 11. Storage Bucket Configuration for 'project-files'
-- ------------------------------------------------------------------------------
-- Create storage bucket if not already existing
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage access policies
CREATE POLICY "Users can upload files into project-files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view/download files in project-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-files');

CREATE POLICY "Users can delete their files in project-files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');
