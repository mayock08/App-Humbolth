ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level_id INTEGER;

ALTER TABLE public.courses
    ADD CONSTRAINT fk_courses_level
    FOREIGN KEY (level_id)
    REFERENCES public.school_levels (id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_level_id ON public.courses(level_id);
