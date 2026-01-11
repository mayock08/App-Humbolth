-- =====================================================================
-- TABLA: student_profiles
-- Perfiles de estudiantes con datos de IQ, estilos de aprendizaje y niveles
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.student_profiles (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE,
    
    -- IQ Assessment
    iq_score INTEGER CHECK (iq_score >= 0 AND iq_score <= 200),
    iq_scale VARCHAR(50), -- 'WAIS-IV', 'WISC-V', 'Stanford-Binet', etc.
    iq_assessed_at TIMESTAMPTZ,
    
    -- Learning Style
    learning_style VARCHAR(50), -- 'Visual', 'Auditivo', 'Kinestésico', 'Mixto'
    
    -- Skill Levels (0-100)
    visual_level INTEGER CHECK (visual_level >= 0 AND visual_level <= 100),
    math_level INTEGER CHECK (math_level >= 0 AND math_level <= 100),
    language_level INTEGER CHECK (language_level >= 0 AND language_level <= 100),
    kinesthetic_level INTEGER CHECK (kinesthetic_level >= 0 AND kinesthetic_level <= 100),
    musical_level INTEGER CHECK (musical_level >= 0 AND musical_level <= 100),
    social_level INTEGER CHECK (social_level >= 0 AND social_level <= 100),
    self_management INTEGER CHECK (self_management >= 0 AND self_management <= 100),
    tech_affinity INTEGER CHECK (tech_affinity >= 0 AND tech_affinity <= 100),
    creativity_level INTEGER CHECK (creativity_level >= 0 AND creativity_level <= 100),
    
    -- Study Preferences
    preferred_study_time VARCHAR(20), -- 'Mañana', 'Tarde', 'Noche'
    preferred_modality VARCHAR(50), -- 'Presencial', 'Virtual', 'Híbrido'
    prefers_group_work BOOLEAN DEFAULT false,
    prefers_individual_work BOOLEAN DEFAULT true,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Foreign Key
    CONSTRAINT fk_student_profiles_student
        FOREIGN KEY (student_id)
        REFERENCES public.students(id)
        ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_student_profiles_student ON public.student_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_learning_style ON public.student_profiles(learning_style);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_student_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_student_profiles_updated_at();
