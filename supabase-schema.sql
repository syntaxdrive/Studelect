-- =========================================================================
-- StudElect: Multi-Tenant Nigerian University Election Platform Schema
-- Optimized for Supabase PostgreSQL with Row-Level Security (RLS)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
DO $$ BEGIN
    CREATE TYPE org_type AS ENUM ('SUG', 'FACULTY', 'DEPARTMENT', 'HALL', 'CLUB');
    CREATE TYPE program_type AS ENUM ('FULL_TIME', 'PART_TIME', 'DLI', 'SANDWICH', 'POSTGRADUATE');
    CREATE TYPE disciplinary_status AS ENUM ('GOOD_STANDING', 'PROBATION', 'SUSPENDED', 'EXPELLED');
    CREATE TYPE election_status AS ENUM ('DRAFT', 'SCHEDULED', 'ACCREDITATION_OPEN', 'LIVE', 'CONCLUDED', 'AUDITED');
    CREATE TYPE results_visibility AS ENUM ('LIVE', 'SEALED_UNTIL_CLOSE');
    CREATE TYPE auth_mode AS ENUM ('PIN_SLIP', 'EMAIL_OTP', 'TELEGRAM', 'SECRET_MATCH');
    CREATE TYPE candidate_status AS ENUM ('NOMINATED', 'CLEARED', 'DISQUALIFIED');
    CREATE TYPE accreditation_status AS ENUM ('ELIGIBLE', 'ACCREDITED', 'TOKEN_ISSUED', 'VOTED', 'DISQUALIFIED');
    CREATE TYPE admin_role_type AS ENUM ('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ELCOM_CHAIRMAN', 'RETURNING_OFFICER', 'POLLING_AGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Institutions Table (Tenant Root)
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Organizations Table (SUG, Faculty, Dept, Hall)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    org_type org_type NOT NULL,
    code VARCHAR(50) NOT NULL,
    parent_org_id UUID REFERENCES organizations(id),
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, slug)
);

-- 4. Students Master Register & Eligibility
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    matric_no VARCHAR(100) NOT NULL,
    normalized_matric VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(50),
    faculty VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    level INT NOT NULL,
    program_type program_type DEFAULT 'FULL_TIME',
    is_registered_session BOOLEAN DEFAULT TRUE,
    dues_paid BOOLEAN DEFAULT FALSE,
    disciplinary_status disciplinary_status DEFAULT 'GOOD_STANDING',
    hall_of_residence VARCHAR(150),
    portal_pin VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, normalized_matric)
);

-- 5. Elections Table
CREATE TABLE IF NOT EXISTS elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    academic_session VARCHAR(50) NOT NULL,
    description TEXT,
    status election_status DEFAULT 'DRAFT',
    results_visibility results_visibility DEFAULT 'LIVE',
    auth_mode auth_mode DEFAULT 'PIN_SLIP',
    require_dues_payment BOOLEAN DEFAULT TRUE,
    require_full_time_only BOOLEAN DEFAULT TRUE,
    require_good_disciplinary_standing BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    multi_sig_approvals JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Posts (Positions) Table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    max_selections INT DEFAULT 1,
    display_order INT DEFAULT 0,
    allowed_levels INT[] DEFAULT '{}',
    allowed_departments TEXT[] DEFAULT '{}',
    gender_restriction VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    matric_no VARCHAR(100),
    photo_url TEXT,
    manifesto TEXT,
    slogan TEXT,
    running_mate VARCHAR(255),
    status candidate_status DEFAULT 'NOMINATED',
    vote_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Voter Accreditations (Identity linked here ONLY, never on Ballot)
CREATE TABLE IF NOT EXISTS voter_accreditations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status accreditation_status DEFAULT 'ELIGIBLE',
    disqualification_reason TEXT,
    voter_pin_hash TEXT,
    token_issued_at TIMESTAMPTZ,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(election_id, student_id)
);

-- 9. Anonymous Ballots Store (Decoupled: Zero link to student identity)
CREATE TABLE IF NOT EXISTS ballots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    receipt_hash VARCHAR(100) UNIQUE NOT NULL,
    selections JSONB NOT NULL, -- Array of { post_id, candidate_id }
    cast_at TIMESTAMPTZ DEFAULT NOW(),
    block_hash TEXT NOT NULL
);

-- 10. Audit Ledger (Immutable Hash-Chained Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    actor_id VARCHAR(100),
    actor_role VARCHAR(100),
    payload JSONB,
    prev_hash TEXT NOT NULL,
    current_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ballots ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public Read Institutions" ON institutions FOR SELECT USING (true);
CREATE POLICY "Public Read Organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public Read Elections" ON elections FOR SELECT USING (true);
CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public Read Candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Public Read Ballots" ON ballots FOR SELECT USING (true);

-- =========================================================================
-- Initial Seed Data: UNILAG & NACOS Election 2026
-- =========================================================================

INSERT INTO institutions (id, name, slug, code, logo_url)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'University of Lagos',
    'unilag',
    'UNILAG',
    '🏛️'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO organizations (id, institution_id, name, slug, org_type, code)
VALUES (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Nigeria Association of Computing Students (NACOS)',
    'nacos-unilag',
    'DEPARTMENT',
    'NACOS'
) ON CONFLICT (institution_id, slug) DO NOTHING;

INSERT INTO elections (
    id,
    organization_id,
    title,
    academic_session,
    description,
    status,
    results_visibility,
    auth_mode,
    starts_at,
    ends_at
) VALUES (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'NACOS 2026/2027 Executive Council & Parliament Elections',
    '2025/2026',
    'Official annual elections for NACOS executives and departmental representatives.',
    'LIVE',
    'LIVE',
    'PIN_SLIP',
    NOW() - INTERVAL '3 hours',
    NOW() + INTERVAL '5 hours'
) ON CONFLICT (id) DO NOTHING;
