-- Add password_hash and is_active to teachers table
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index for faster lookups if needed (email already indexed)
-- CREATE INDEX IF NOT EXISTS idx_teachers_is_active ON public.teachers(is_active);
