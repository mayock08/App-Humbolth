-- Add matricula column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS matricula VARCHAR(50);

-- Add unique constraint to students matricula (optional, but recommended for ID fields)
-- Using a partial index to allow multiple NULLs if matricula is not mandatory initially
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_matricula 
ON public.students(matricula) 
WHERE matricula IS NOT NULL;

-- Add matricula column to teachers table
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS matricula VARCHAR(50);

-- Add unique constraint to teachers matricula
CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_matricula 
ON public.teachers(matricula) 
WHERE matricula IS NOT NULL;
