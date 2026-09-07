-- =============================================================================
-- STUDBALLOT / STUDELECT • COMPLETE DATABASE TEARDOWN & RESET SCRIPT
-- WARNING: This will permanently DROP all tables, enums, views, and data!
-- Run this in your Supabase SQL Editor if you need a completely clean slate.
-- =============================================================================

-- 1. DISABLE ROW LEVEL SECURITY TEMPORARILY & DROP REALTIME PUBLICATIONS
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.ballots;
EXCEPTION
    WHEN undefined_table THEN null;
    WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.elections;
EXCEPTION
    WHEN undefined_table THEN null;
    WHEN undefined_object THEN null;
END $$;

-- 2. DROP ALL APPLICATION TABLES (CASCADE handles foreign key dependencies)
DROP TABLE IF EXISTS public.ballots CASCADE;
DROP TABLE IF EXISTS public.voter_accreditations CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.elections CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.institutions CASCADE;

-- Drop Prisma migration history if present
DROP TABLE IF EXISTS public._prisma_migrations CASCADE;

-- 3. DROP ALL CUSTOM ENUM TYPES
DROP TYPE IF EXISTS public.org_type CASCADE;
DROP TYPE IF EXISTS public.program_type CASCADE;
DROP TYPE IF EXISTS public.disciplinary_status CASCADE;
DROP TYPE IF EXISTS public.election_status CASCADE;
DROP TYPE IF EXISTS public.results_visibility CASCADE;
DROP TYPE IF EXISTS public.auth_mode CASCADE;
DROP TYPE IF EXISTS public.candidate_status CASCADE;
DROP TYPE IF EXISTS public.accreditation_status CASCADE;
DROP TYPE IF EXISTS public.admin_role_type CASCADE;

-- 4. CONFIRMATION MESSAGE
SELECT 'StudElect database tables and types have been successfully dropped and reset.' AS status;
