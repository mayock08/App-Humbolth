-- Function to generate Matricula based on Level
CREATE OR REPLACE FUNCTION public.generate_matricula()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    seq_val BIGINT;
    level_name TEXT;
BEGIN
    -- Only generate if not provided
    IF NEW.matricula IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Get Level Name via Group -> Grade -> Level
    -- Note: NEW.group_id is nullable, if null we can't determine level effectively or default to 'X'
    IF NEW.group_id IS NULL THEN
        RETURN NEW; -- Can't generate without group
    END IF;

    SELECT l.name INTO level_name
    FROM public.school_groups g
    JOIN public.school_grades gr ON g.grade_id = gr.id
    JOIN public.school_levels l ON gr.level_id = l.id
    WHERE g.id = NEW.group_id;

    -- Determine Prefix
    CASE 
        WHEN level_name = 'Preparatoria' THEN prefix := 'P';
        WHEN level_name = 'Secundaria' THEN prefix := 'S';
        WHEN level_name = 'Primaria' THEN prefix := 'PR';
        WHEN level_name = 'Kinder' THEN prefix := 'K';
        ELSE prefix := 'E'; -- Error/External?
    END CASE;

    -- Get/Create Sequence for this prefix
    -- We can use a single sequence or per-prefix. Single global sequence is easier to maintain uniqueness if needed, 
    -- but per-prefix gives P000001, S000001 starting from 1 each.
    -- Let's use a global sequence for simplicity of "matricula_seq" or per prefix if user wants strictly "P001, S001".
    -- User example: P0000001, S000001. Implies independent numbering? or just format?
    -- Safest is global sequence to avoid collisions if prefixes change, but let's try per-prefix simulated by just a shared sequence to keep it unique across school? 
    -- Actually, usually P001 and S001 are different students.
    -- Let's use a shared sequence for the NUMBER part to ensure global uniqueness of the number if desired, OR just a sequence. 
    -- Let's use specific sequences for P, S, etc if we want them to start at 1. 
    -- Simpler approach: One sequence `student_matricula_seq`.
    
    -- Check if sequence exists (dynamic creation is tricky in trigger). 
    -- Let's assume a single sequence `public.student_matricula_seq` created globally.
    
    seq_val := nextval('public.student_matricula_seq');
    
    -- Format: Prefix + 7 digits padded
    NEW.matricula := prefix || LPAD(seq_val::TEXT, 7, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Sequence
CREATE SEQUENCE IF NOT EXISTS public.student_matricula_seq START 1;

-- Create Trigger
DROP TRIGGER IF EXISTS trg_generate_matricula ON public.students;

CREATE TRIGGER trg_generate_matricula
BEFORE INSERT ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.generate_matricula();

-- Update Existing Students (One-time run)
DO $$
DECLARE
    s record;
    prefix TEXT;
    seq_val BIGINT;
    level_name TEXT;
BEGIN
    FOR s IN SELECT * FROM public.students WHERE matricula IS NULL LOOP
        IF s.group_id IS NOT NULL THEN
            SELECT l.name INTO level_name
            FROM public.school_groups g
            JOIN public.school_grades gr ON g.grade_id = gr.id
            JOIN public.school_levels l ON gr.level_id = l.id
            WHERE g.id = s.group_id;

            CASE 
                WHEN level_name = 'Preparatoria' THEN prefix := 'P';
                WHEN level_name = 'Secundaria' THEN prefix := 'S';
                WHEN level_name = 'Primaria' THEN prefix := 'PR';
                WHEN level_name = 'Kinder' THEN prefix := 'K';
                ELSE prefix := 'E';
            END CASE;

            seq_val := nextval('public.student_matricula_seq');
            
            UPDATE public.students 
            SET matricula = prefix || LPAD(seq_val::TEXT, 7, '0')
            WHERE id = s.id;
        END IF;
    END LOOP;
END $$;
