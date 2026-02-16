-- 1. Insert Coordinator Role
INSERT INTO public.roles (name, description) 
VALUES ('coordinator', 'Coordinador Académico') 
ON CONFLICT (name) DO NOTHING;

-- 2. Create Coordinators Table
CREATE TABLE IF NOT EXISTS public.coordinators (
    id              BIGSERIAL PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(100) UNIQUE,
    password_hash   TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Coordinator Assignments Table (Many-to-Many with School Groups)
CREATE TABLE IF NOT EXISTS public.coordinator_groups (
    id              BIGSERIAL PRIMARY KEY,
    coordinator_id  BIGINT NOT NULL REFERENCES public.coordinators(id) ON DELETE CASCADE,
    group_id        BIGINT NOT NULL REFERENCES public.school_groups(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(coordinator_id, group_id)
);

-- Index for faster lookup of groups by coordinator
CREATE INDEX IF NOT EXISTS idx_coordinator_groups_coord ON public.coordinator_groups(coordinator_id);

-- 4. Insert Default Coordinator (Optional, for testing)
INSERT INTO public.coordinators (full_name, email, password_hash, is_active)
VALUES ('Coordinador Demo', 'coordinator@edu.com', 'coordinator123', true)
ON CONFLICT (email) DO NOTHING;

