-- Add password_hash column to guardians table
ALTER TABLE public.guardians ADD COLUMN password_hash TEXT;

-- Set default password 'parent123' for existing guardians
UPDATE public.guardians SET password_hash = 'parent123' WHERE password_hash IS NULL;

-- Verify changes
-- SELECT * FROM public.guardians LIMIT 5;
