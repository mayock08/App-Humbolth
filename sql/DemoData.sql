-- =========================================================================================
-- SCRIPT DE DATOS DEMO PARA HUMBOLTH (BULK VERSION CON MATERIAS)
-- Ejecutar este script después de haber creado la estructura de la base de datos.
-- =========================================================================================

-- 1. FAMILIAS Y TUTORES ESPECÍFICOS (Para pruebas controladas)
INSERT INTO public.families (family_number, family_name) VALUES
('FAM-001', 'Familia Pérez López'),
('FAM-002', 'Familia García Márquez')
ON CONFLICT DO NOTHING;

INSERT INTO public.guardians (full_name, phone, email, workplace, occupation, is_mother, is_father) VALUES
('María López', '555-001-0001', 'maria.lopez@email.com', 'Hospital General', 'Doctora', TRUE, FALSE),
('Juan Pérez', '555-001-0002', 'juan.perez@email.com', 'Constructora SA', 'Ingeniero Civil', FALSE, TRUE),
('Luisa Márquez', '555-002-0001', 'luisa.marquez@email.com', 'Escuela Primaria', 'Maestra', TRUE, FALSE),
('Carlos García', '555-002-0002', 'carlos.garcia@email.com', 'Banco Nacional', 'Gerente', FALSE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 2. DOCENTES (Base + Generados)
INSERT INTO public.teachers (full_name, email, phone) VALUES
('Prof. Albert Einstein', 'albert.e@humbolth.edu', '555-SCI-ENCE'),
('Prof. Frida Kahlo', 'frida.k@humbolth.edu', '555-ART-LOVE'),
('Prof. Marie Curie', 'marie.c@humbolth.edu', '555-RAD-IATION'),
('Prof. Isaac Newton', 'isaac.n@humbolth.edu', '555-GRA-VITY'),
('Prof. Nikola Tesla', 'nikola.t@humbolth.edu', '555-ELE-CTRIC'),
('Prof. Galileo Galilei', 'galileo.g@humbolth.edu', '555-STA-RGAZ'),
('Prof. Charles Darwin', 'charles.d@humbolth.edu', '555-EVO-LUTI'),
('Prof. Ada Lovelace', 'ada.l@humbolth.edu', '555-COM-PUTE'),
('Prof. Alan Turing', 'alan.t@humbolth.edu', '555-ENI-GMA'),
('Prof. Stephen Hawking', 'stephen.h@humbolth.edu', '555-BLA-CKHO')
ON CONFLICT (email) DO NOTHING;

-- 3. GENERACIÓN DE CURSOS PARA TODOS LOS GRUPOS
-- Se crean 4 materias base para CADA grupo existente en la base de datos.
DO $$
DECLARE
    grp RECORD;
    grade_name VARCHAR;
    full_grade_str VARCHAR;
    t_id BIGINT;
    teachers_count INT;
BEGIN
    SELECT COUNT(*) INTO teachers_count FROM public.teachers;

    FOR grp IN 
        SELECT g.id, g.name as group_name, gr.name as grade_name 
        FROM public.school_groups g
        JOIN public.school_grades gr ON g.grade_id = gr.id
    LOOP
        full_grade_str := grp.grade_name || grp.group_name; -- Ej: "1A"
        
        -- Asignar profesor aleatorio (usando ID offset o random)
        -- Matemáticas
        SELECT id INTO t_id FROM public.teachers ORDER BY random() LIMIT 1;
        INSERT INTO public.courses (name, grade, teacher_id) VALUES ('Matemáticas', full_grade_str, t_id) ON CONFLICT DO NOTHING;
        
        -- Español
        SELECT id INTO t_id FROM public.teachers ORDER BY random() LIMIT 1;
        INSERT INTO public.courses (name, grade, teacher_id) VALUES ('Español', full_grade_str, t_id) ON CONFLICT DO NOTHING;
        
        -- Historia
        SELECT id INTO t_id FROM public.teachers ORDER BY random() LIMIT 1;
        INSERT INTO public.courses (name, grade, teacher_id) VALUES ('Historia', full_grade_str, t_id) ON CONFLICT DO NOTHING;
        
        -- Ciencias
        SELECT id INTO t_id FROM public.teachers ORDER BY random() LIMIT 1;
        INSERT INTO public.courses (name, grade, teacher_id) VALUES ('Ciencias', full_grade_str, t_id) ON CONFLICT DO NOTHING;
        
    END LOOP;
END $$;

-- 4. ALUMNOS ESPECÍFICOS (Para pruebas de login)
DO $$
DECLARE
    f_perez_id BIGINT;
    f_garcia_id BIGINT;
    g_1a_primaria INT;
    g_2b_secundaria INT;
    s_pedro_id BIGINT;
    s_anita_id BIGINT;
BEGIN
    SELECT id INTO f_perez_id FROM public.families WHERE family_number = 'FAM-001';
    SELECT id INTO f_garcia_id FROM public.families WHERE family_number = 'FAM-002';

    -- Buscar grupos específicos
    SELECT g.id INTO g_1a_primaria 
    FROM public.school_groups g
    JOIN public.school_grades gr ON g.grade_id = gr.id
    JOIN public.school_levels l ON gr.level_id = l.id
    WHERE l.name = 'Primaria' AND gr.name = '1' AND g.name = 'A' LIMIT 1;

    SELECT g.id INTO g_2b_secundaria 
    FROM public.school_groups g
    JOIN public.school_grades gr ON g.grade_id = gr.id
    JOIN public.school_levels l ON gr.level_id = l.id
    WHERE l.name = 'Secundaria' AND gr.name = '2' AND g.name = 'B' LIMIT 1;

    -- Insertar Pedrito
    INSERT INTO public.students (
        first_name, paternal_surname, maternal_surname, gender, birth_date, 
        curp, email, phone, current_grade, current_group, status, family_id, group_id
    ) VALUES (
        'Pedrito', 'Pérez', 'López', 'Masculino', '2015-05-10', 
        'PELP150510HDFRNS01', 'pedrito.perez@humbolth.edu', '555-111-1111', '1', 'A', 'Activo', f_perez_id, g_1a_primaria
    ) ON CONFLICT DO NOTHING RETURNING id INTO s_pedro_id;
    
    IF s_pedro_id IS NULL THEN SELECT id INTO s_pedro_id FROM public.students WHERE email = 'pedrito.perez@humbolth.edu'; END IF;

    -- Insertar Anita
    INSERT INTO public.students (
        first_name, paternal_surname, maternal_surname, gender, birth_date, 
        curp, email, phone, current_grade, current_group, status, family_id, group_id
    ) VALUES (
        'Anita', 'García', 'Márquez', 'Femenino', '2010-08-20', 
        'GAMA100820MDFRNS02', 'anita.garcia@humbolth.edu', '555-222-2222', '2', 'B', 'Activo', f_garcia_id, g_2b_secundaria
    ) ON CONFLICT DO NOTHING RETURNING id INTO s_anita_id;

    IF s_anita_id IS NULL THEN SELECT id INTO s_anita_id FROM public.students WHERE email = 'anita.garcia@humbolth.edu'; END IF;

    -- Inscribir Pedrito y Anita en sus materias (1A y 2B)
    INSERT INTO public.enrollments (student_id, course_id)
    SELECT s_pedro_id, c.id FROM public.courses c WHERE c.grade = '1A'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.enrollments (student_id, course_id)
    SELECT s_anita_id, c.id FROM public.courses c WHERE c.grade = '2B'
    ON CONFLICT DO NOTHING;

END $$;

-- 5. GENERACIÓN MASIVA DE 600 ALUMNOS E INSCRIPCIONES
DO $$
DECLARE
    i INT;
    f_id BIGINT;
    s_id BIGINT;
    first_names TEXT[] := ARRAY['Juan', 'Maria', 'Pedro', 'Ana', 'Luis', 'Sofia', 'Carlos', 'Lucia', 'Jose', 'Elena', 'Miguel', 'Valentina', 'David', 'Camila', 'Jorge', 'Isabella', 'Fernando', 'Ximena', 'Ricardo', 'Valeria', 'Daniel', 'Mariana', 'Roberto', 'Gabriela', 'Alejandro', 'Daniela', 'Manuel', 'Fernanda', 'Jesus', 'Victoria'];
    last_names TEXT[] := ARRAY['Garcia', 'Martinez', 'Lopez', 'Gonzalez', 'Rodriguez', 'Fernandez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Cruz', 'Morales', 'Reyes', 'Gutierrez', 'Ortiz', 'Castillo', 'Jimenez', 'Ruiz', 'Alvarez', 'Hernandez', 'Romero', 'Moreno', 'Chavez', 'Ramos', 'Herrera', 'Medina'];
    fname TEXT;
    lname1 TEXT;
    lname2 TEXT;
    full_email TEXT;
    random_group_id INT;
    grade_name VARCHAR;
    group_name VARCHAR;
    full_grade_str VARCHAR;
BEGIN
    -- Loop para 600 alumnos
    FOR i IN 1..600 LOOP
        -- Generar nombres aleatorios
        fname := first_names[1 + floor(random() * array_length(first_names, 1))::int];
        lname1 := last_names[1 + floor(random() * array_length(last_names, 1))::int];
        lname2 := last_names[1 + floor(random() * array_length(last_names, 1))::int];
        full_email := lower(fname || '.' || lname1 || i::text || '@humbolth.edu');

        -- Crear Familia
        INSERT INTO public.families (family_name, family_number) 
        VALUES ('Familia ' || lname1 || ' ' || lname2, 'FAM-BLK-' || i) 
        RETURNING id INTO f_id;

        -- Seleccionar Grupo Aleatorio
        SELECT id, name INTO random_group_id, group_name 
        FROM public.school_groups 
        ORDER BY random() 
        LIMIT 1;
        
        -- Obtener nombre del grado
        SELECT name INTO grade_name 
        FROM public.school_grades 
        WHERE id = (SELECT grade_id FROM public.school_groups WHERE id = random_group_id);
        
        full_grade_str := grade_name || group_name;

        -- Insertar Alumno
        INSERT INTO public.students (
            first_name, paternal_surname, maternal_surname, gender, birth_date,
            email, phone, current_grade, current_group, status, family_id, group_id,
            street_address, city, state
        ) VALUES (
            fname, lname1, lname2, 
            CASE WHEN random() > 0.5 THEN 'Masculino' ELSE 'Femenino' END,
            CURRENT_DATE - (floor(random() * 365 * 15) + 365 * 5)::int * '1 day'::interval,
            full_email, 
            '555-' || floor(random()*899+100)::text || '-' || floor(random()*8999+1000)::text,
            grade_name,
            group_name,
            'Activo', f_id, random_group_id,
            'Calle ' || floor(random()*100)::text || ' # ' || floor(random()*500)::text,
            'Ciudad de México', 'CDMX'
        ) RETURNING id INTO s_id;

        -- INSCRIBIR ALUMNO EN MATERIAS DE SU GRUPO
        -- Busca todas las materias que coincidan con el grado/grupo (ej: "1A")
        INSERT INTO public.enrollments (student_id, course_id)
        SELECT s_id, c.id 
        FROM public.courses c 
        WHERE c.grade = full_grade_str
        ON CONFLICT DO NOTHING;
        
    END LOOP;
END $$;

-- 6. IQ TEST DATA (Igual que antes)
DO $$
DECLARE
    t_id BIGINT;
    s_logic BIGINT;
    q_id BIGINT;
BEGIN
    INSERT INTO public.iq_tests (name, description, total_time_minutes)
    VALUES ('IQ Test Demo Completo', 'Examen de demostración.', 60)
    ON CONFLICT DO NOTHING RETURNING id INTO t_id;

    IF t_id IS NULL THEN SELECT id INTO t_id FROM public.iq_tests WHERE name = 'IQ Test Demo Completo'; END IF;

    IF t_id IS NOT NULL THEN
        INSERT INTO public.iq_sections (test_id, name, description, order_index, time_limit_minutes)
        VALUES (t_id, 'Lógica Matemática', 'Series numéricas.', 1, 15)
        ON CONFLICT DO NOTHING RETURNING id INTO s_logic;
        
        IF s_logic IS NULL THEN SELECT id INTO s_logic FROM public.iq_sections WHERE test_id = t_id AND order_index = 1; END IF;

        INSERT INTO public.iq_questions (section_id, text, difficulty, order_index, score, ability_domain)
        VALUES (s_logic, '2, 4, 8, 16, ... ¿Qué número sigue?', 1, 1, 10, 'logic')
        ON CONFLICT DO NOTHING RETURNING id INTO q_id;

        IF q_id IS NOT NULL THEN
            INSERT INTO public.iq_options (question_id, option_key, text, is_correct) VALUES
            (q_id, 'A', '20', FALSE), (q_id, 'B', '24', FALSE), (q_id, 'C', '32', TRUE), (q_id, 'D', '64', FALSE)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;
