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
-- 7. FAQs Table (Minimum of 10 Stored in SQL Database)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. Error Codes Knowledgebase Table (Minimum 8 Error Codes Stored in SQL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.error_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cause TEXT NOT NULL,
  solution TEXT NOT NULL,
  is_site_specific BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 9. Support Tickets Table (Stored in SQL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  error_code INT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 10. Performance Indexes
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
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- ------------------------------------------------------------------------------
-- 11. Row Level Security (RLS) - Strict User Isolation
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

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

-- FAQs Policies (Publicly readable)
CREATE POLICY "Anyone can view FAQs"
  ON public.faqs FOR SELECT
  USING (true);

-- Error Codes Policies (Publicly readable)
CREATE POLICY "Anyone can view error codes"
  ON public.error_codes FOR SELECT
  USING (true);

-- Support Tickets Policies
CREATE POLICY "Users can view their own support tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users and visitors can submit support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 12. Automatic Updated_At Timestamp Trigger
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

DROP TRIGGER IF EXISTS set_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER set_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 13. Automatically Create User Profile on Sign Up
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
-- 14. Storage Bucket Configuration for 'project-files'
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload files into project-files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view/download files in project-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-files');

CREATE POLICY "Users can delete their files in project-files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-files' AND auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 15. SEED DATA: 11 Comprehensive FAQs
-- ------------------------------------------------------------------------------
INSERT INTO public.faqs (question, answer, category) VALUES
(
  'What is Engineer''s Project Hub?',
  'Engineer''s Project Hub is a unified full-stack engineering workspace where students and professionals track hardware and software projects, record engineering notes, evaluate math formulas, upload CAD drawings/schematics, and manage milestones.',
  'General'
),
(
  'How do I create and manage a project?',
  'Click the "+ New Project" button on the dashboard or top navigation. Enter a project title, brief technical objective, select your engineering discipline (Robotics, Mechanical, Electronics, Software, etc.), and choose an initial status (Not Started, In Progress, Completed).',
  'Projects'
),
(
  'How does the Engineering Formula Calculator work?',
  'The calculation engine evaluates standard mathematical expressions with variables. It supports operators (+, -, *, /, ^), trigonometry (sin, cos, tan), roots (sqrt), powers, and natural logarithms. You can define input variables with values and units, then click Evaluate to calculate real-time results.',
  'Calculations'
),
(
  'What types of files can I upload to a project workspace?',
  'You can upload project images (PNG, JPG, SVG, WEBP), CAD diagrams, circuit schematics, PDF datasheets, CSV data tables, and code files up to 25MB per file. Image files have an interactive lightbox zoom preview.',
  'Storage'
),
(
  'Is my engineering data private from other users?',
  'Yes. All project data is protected by Supabase Row-Level Security (RLS). Database policies enforce that you can only view, edit, or delete records that match your authenticated User ID.',
  'Security'
),
(
  'Can I use the app without connecting Supabase?',
  'Yes! The application includes a Local Demo Mode that runs in your browser with persistent local storage. You can test all features immediately. When you are ready, add your Supabase credentials in .env to switch to cloud persistence.',
  'General'
),
(
  'What should I do if an engineering calculation results in an error?',
  'Check your formula syntax. Ensure variable names in the formula match your defined input variables exactly. Division by zero will trigger site-specific error code 480 (ERR_CALC_SYNTAX).',
  'Calculations'
),
(
  'How do I export or share my calculation results?',
  'Each calculation card has a "Copy" button. Clicking this copies a cleanly formatted engineering summary of the title, formula, all input variables with units, and evaluated result directly to your clipboard.',
  'Calculations'
),
(
  'How are support tickets submitted and tracked?',
  'If the AI assistant cannot answer your question or if you encounter an unexpected issue, you can create a support ticket directly through the AI chat widget or via the Support Tickets page. Tickets are stored permanently in the SQL database.',
  'Support'
),
(
  'Where are chat logs and user feedback stored?',
  'Chat interaction logs and thumbs-up/thumbs-down feedback are dispatched to MongoDB via our serverless API endpoint, separating operational metrics from relational SQL application data.',
  'Architecture'
),
(
  'What third-party APIs does Engineer''s Project Hub use?',
  'The hub integrates with an external Engineering Environmental & Status API with an AbortController timeout limit (3000ms) and automatic graceful fallback so the application stays responsive even during upstream outages.',
  'Integrations'
)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 16. SEED DATA: 8 Required Error Codes (including site-specific code 480)
-- ------------------------------------------------------------------------------
INSERT INTO public.error_codes (code, name, description, cause, solution, is_site_specific) VALUES
(
  400,
  'Bad Request',
  'The server cannot process the request due to malformed request syntax or invalid input data.',
  'Missing required fields (e.g. project title, email) or corrupted JSON payload sent in the request.',
  'Check form validation errors, ensure all required fields are filled, and resubmit.',
  FALSE
),
(
  401,
  'Unauthorized',
  'Authentication is required and has failed or has not yet been provided.',
  'Your session token has expired, or you attempted to perform an action while logged out.',
  'Click the Sign In button in the navigation header, re-enter your credentials, and try again.',
  FALSE
),
(
  403,
  'Forbidden',
  'The server understood the request, but refuses to authorize it due to permission constraints.',
  'Attempted to access, edit, or delete another user''s project or file, blocked by Supabase Row Level Security (RLS).',
  'Ensure you are logged into the account that owns the project. Contact the owner if you need access.',
  FALSE
),
(
  404,
  'Not Found',
  'The server cannot find the requested resource or URL route.',
  'The requested project ID, document path, or page route does not exist or has been deleted.',
  'Verify the URL address or return to the Dashboard. Use the "Ask Assistant" button for help locating resources.',
  FALSE
),
(
  429,
  'Too Many Requests',
  'The user has sent too many requests in a given amount of time (rate limit exceeded).',
  'Excessive API calls or rapid repeated clicks on calculation or AI assistant query triggers.',
  'Wait 30 seconds before sending another prompt or request to let the rate limit window reset.',
  FALSE
),
(
  500,
  'Internal Server Error',
  'The server encountered an unexpected condition that prevented it from fulfilling the request.',
  'Unhandled exception, database connectivity timeout, or database query error on the backend.',
  'Reload the page or check the Health Check page. If the issue persists, submit a support ticket via the AI assistant.',
  FALSE
),
(
  503,
  'Service Unavailable',
  'The server is currently unable to handle the request due to temporary overloading or maintenance.',
  'Supabase database paused, cloud maintenance in progress, or upstream network outage.',
  'Check your internet connection and Supabase dashboard project status. Try again in a few minutes.',
  FALSE
),
(
  480,
  'ERR_CALC_SYNTAX (Site-Specific Error)',
  'Engineering calculation formula syntax error, undefined variable reference, or division by zero.',
  'The math formula contains mismatched parentheses, an unrecognized function, or references variables not defined in the input parameters.',
  'Review the formula expression. Ensure all variables are declared in the input table and that denominators do not equal zero.',
  TRUE
)
ON CONFLICT (code) DO NOTHING;
