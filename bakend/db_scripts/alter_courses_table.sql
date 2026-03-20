-- Add new columns to courses table
ALTER TABLE public.courses
ADD COLUMN code VARCHAR(50),
ADD COLUMN credits INTEGER DEFAULT 0,
ADD COLUMN schedule_days VARCHAR(50), -- Comma separated days e.g. "L,M,Mi,J,V"
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME;

-- Update existing records if needed (optional)
-- UPDATE public.courses SET credits = 4 WHERE credits IS NULL;
