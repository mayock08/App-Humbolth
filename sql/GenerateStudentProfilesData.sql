-- =====================================================================
-- SCRIPT: Generar Datos Aleatorios para student_profiles
-- =====================================================================

-- Función para generar datos aleatorios de perfiles de estudiantes
CREATE OR REPLACE FUNCTION generate_random_student_profiles(num_profiles INTEGER DEFAULT 50)
RETURNS void AS $$
DECLARE
    student_record RECORD;
    random_iq INTEGER;
    random_learning_style VARCHAR(50);
    random_study_time VARCHAR(20);
    random_modality VARCHAR(50);
BEGIN
    -- Iterar sobre estudiantes que no tienen perfil
    FOR student_record IN 
        SELECT s.id 
        FROM public.students s
        LEFT JOIN public.student_profiles sp ON s.id = sp.student_id
        WHERE sp.id IS NULL
        LIMIT num_profiles
    LOOP
        -- Generar valores aleatorios
        random_iq := 70 + floor(random() * 60)::INTEGER; -- IQ entre 70 y 130
        
        -- Learning Style aleatorio
        random_learning_style := CASE floor(random() * 4)::INTEGER
            WHEN 0 THEN 'Visual'
            WHEN 1 THEN 'Auditivo'
            WHEN 2 THEN 'Kinestésico'
            ELSE 'Mixto'
        END;
        
        -- Study Time aleatorio
        random_study_time := CASE floor(random() * 3)::INTEGER
            WHEN 0 THEN 'Mañana'
            WHEN 1 THEN 'Tarde'
            ELSE 'Noche'
        END;
        
        -- Modality aleatorio
        random_modality := CASE floor(random() * 3)::INTEGER
            WHEN 0 THEN 'Presencial'
            WHEN 1 THEN 'Virtual'
            ELSE 'Híbrido'
        END;
        
        -- Insertar perfil
        INSERT INTO public.student_profiles (
            student_id,
            iq_score,
            iq_scale,
            iq_assessed_at,
            learning_style,
            visual_level,
            math_level,
            language_level,
            kinesthetic_level,
            musical_level,
            social_level,
            self_management,
            tech_affinity,
            creativity_level,
            preferred_study_time,
            preferred_modality,
            prefers_group_work,
            prefers_individual_work,
            notes
        ) VALUES (
            student_record.id,
            random_iq,
            CASE floor(random() * 3)::INTEGER
                WHEN 0 THEN 'WAIS-IV'
                WHEN 1 THEN 'WISC-V'
                ELSE 'Stanford-Binet'
            END,
            NOW() - (random() * 365)::INTEGER * INTERVAL '1 day', -- Fecha aleatoria último año
            random_learning_style,
            50 + floor(random() * 50)::INTEGER, -- visual_level: 50-100
            40 + floor(random() * 60)::INTEGER, -- math_level: 40-100
            50 + floor(random() * 50)::INTEGER, -- language_level: 50-100
            30 + floor(random() * 70)::INTEGER, -- kinesthetic_level: 30-100
            20 + floor(random() * 80)::INTEGER, -- musical_level: 20-100
            40 + floor(random() * 60)::INTEGER, -- social_level: 40-100
            50 + floor(random() * 50)::INTEGER, -- self_management: 50-100
            60 + floor(random() * 40)::INTEGER, -- tech_affinity: 60-100
            40 + floor(random() * 60)::INTEGER, -- creativity_level: 40-100
            random_study_time,
            random_modality,
            random() > 0.5, -- prefers_group_work
            random() > 0.3, -- prefers_individual_work
            'Perfil generado automáticamente para pruebas'
        );
    END LOOP;
    
    RAISE NOTICE 'Se generaron % perfiles de estudiantes', num_profiles;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- EJECUTAR: Generar 50 perfiles aleatorios
-- =====================================================================

-- Descomentar la siguiente línea para ejecutar
-- SELECT generate_random_student_profiles(50);

-- =====================================================================
-- ALTERNATIVA: INSERT directo para perfiles específicos
-- =====================================================================

-- Ejemplo de inserción manual
/*
INSERT INTO public.student_profiles (
    student_id, iq_score, iq_scale, iq_assessed_at, learning_style,
    visual_level, math_level, language_level, kinesthetic_level,
    musical_level, social_level, self_management, tech_affinity,
    creativity_level, preferred_study_time, preferred_modality,
    prefers_group_work, prefers_individual_work, notes
) VALUES
    (1, 115, 'WAIS-IV', NOW() - INTERVAL '3 months', 'Visual', 85, 90, 88, 70, 65, 80, 85, 95, 78, 'Mañana', 'Presencial', false, true, 'Estudiante destacado en matemáticas'),
    (2, 102, 'WISC-V', NOW() - INTERVAL '6 months', 'Auditivo', 75, 80, 92, 60, 85, 88, 75, 70, 82, 'Tarde', 'Híbrido', true, false, 'Excelente en trabajo en equipo'),
    (3, 125, 'Stanford-Binet', NOW() - INTERVAL '2 months', 'Mixto', 95, 98, 95, 85, 75, 90, 92, 88, 90, 'Mañana', 'Presencial', false, true, 'Alto rendimiento académico')
ON CONFLICT (student_id) DO NOTHING;
*/

-- =====================================================================
-- CONSULTAS ÚTILES
-- =====================================================================

-- Ver distribución de estilos de aprendizaje
/*
SELECT 
    learning_style,
    COUNT(*) as cantidad,
    ROUND(AVG(iq_score), 2) as promedio_iq,
    ROUND(AVG(math_level), 2) as promedio_matematicas
FROM public.student_profiles
GROUP BY learning_style
ORDER BY cantidad DESC;
*/

-- Ver estudiantes con alto rendimiento (IQ > 120)
/*
SELECT 
    sp.student_id,
    s.first_name || ' ' || s.paternal_surname as nombre_completo,
    sp.iq_score,
    sp.learning_style,
    sp.math_level,
    sp.language_level
FROM public.student_profiles sp
JOIN public.students s ON sp.student_id = s.id
WHERE sp.iq_score > 120
ORDER BY sp.iq_score DESC;
*/

-- Ver perfiles por preferencia de estudio
/*
SELECT 
    preferred_study_time,
    preferred_modality,
    COUNT(*) as cantidad
FROM public.student_profiles
GROUP BY preferred_study_time, preferred_modality
ORDER BY cantidad DESC;
*/
