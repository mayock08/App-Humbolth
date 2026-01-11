-- OPCIONAL: crea la base si trabajas fuera de Supabase
-- CREATE DATABASE "EscolarDB";

-- =====================================================================
-- 1) Tabla principal de alumnos
--    (corresponde al modelo Student de .NET: Id, Name, Grade, GuardianPhone)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.students (
    id              BIGSERIAL PRIMARY KEY,
    
    -- Datos Básicos
    first_name      VARCHAR(100) NOT NULL,
    paternal_surname VARCHAR(100) NOT NULL,
    maternal_surname VARCHAR(100),
    gender          VARCHAR(20),
    birth_date      DATE,
    birth_place     VARCHAR(100),
    nationality     VARCHAR(50),
    marital_status  VARCHAR(20),
    curp            VARCHAR(20),
    photo_url       TEXT,

    -- Domicilio
    street_address  VARCHAR(200),
    cross_streets   VARCHAR(200),
    city            VARCHAR(100),
    state           VARCHAR(100),
    zip_code        VARCHAR(10),
    email           VARCHAR(100),
    alternate_email VARCHAR(100),
    phone           VARCHAR(20),

    -- Escolaridad
    education_level VARCHAR(50),
    current_grade   VARCHAR(20),
    current_group   VARCHAR(10),
    internal_id     VARCHAR(20),
    official_id     VARCHAR(20),

    -- Status
    status          VARCHAR(20) DEFAULT 'Activo',
    admission_date  DATE,
    admission_cycle VARCHAR(50),

    -- Notas
    notes           TEXT,
    observations    TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    family_id       BIGINT,
    group_id        INT,
    CONSTRAINT fk_students_family
        FOREIGN KEY (family_id)
        REFERENCES public.families(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_students_group
        FOREIGN KEY (group_id)
        REFERENCES public.school_groups(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_students_family ON public.students(family_id);

CREATE INDEX IF NOT EXISTS idx_students_current_grade ON public.students(current_grade);


-- =====================================================================
-- 1.1) Catálogos Escolares (Niveles, Grados, Grupos)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.school_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Kinder, Primaria, Secundaria, Preparatoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.school_grades (
    id SERIAL PRIMARY KEY,
    level_id INT NOT NULL REFERENCES public.school_levels(id),
    name VARCHAR(20) NOT NULL, -- 1, 2, 3...
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(level_id, name)
);

CREATE TABLE IF NOT EXISTS public.school_groups (
    id SERIAL PRIMARY KEY,
    grade_id INT NOT NULL REFERENCES public.school_grades(id),
    name VARCHAR(10) NOT NULL, -- A, B, C
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(grade_id, name)
);

-- Poblar Catálogos
INSERT INTO public.school_levels (name) VALUES 
('Kinder'), ('Primaria'), ('Secundaria'), ('Preparatoria')
ON CONFLICT DO NOTHING;

-- Función auxiliar para insertar grados y grupos
DO $$
DECLARE
    l_kinder INT;
    l_primaria INT;
    l_secundaria INT;
    l_prepa INT;
    g_id INT;
    i INT;
    grp TEXT;
BEGIN
    SELECT id INTO l_kinder FROM public.school_levels WHERE name = 'Kinder';
    SELECT id INTO l_primaria FROM public.school_levels WHERE name = 'Primaria';
    SELECT id INTO l_secundaria FROM public.school_levels WHERE name = 'Secundaria';
    SELECT id INTO l_prepa FROM public.school_levels WHERE name = 'Preparatoria';

    -- Kinder 1-3
    FOR i IN 1..3 LOOP
        INSERT INTO public.school_grades (level_id, name) VALUES (l_kinder, i::text) RETURNING id INTO g_id;
        FOREACH grp IN ARRAY ARRAY['A','B','C'] LOOP
            INSERT INTO public.school_groups (grade_id, name) VALUES (g_id, grp) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- Primaria 1-6
    FOR i IN 1..6 LOOP
        INSERT INTO public.school_grades (level_id, name) VALUES (l_primaria, i::text) RETURNING id INTO g_id;
        FOREACH grp IN ARRAY ARRAY['A','B','C'] LOOP
            INSERT INTO public.school_groups (grade_id, name) VALUES (g_id, grp) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- Secundaria 1-3
    FOR i IN 1..3 LOOP
        INSERT INTO public.school_grades (level_id, name) VALUES (l_secundaria, i::text) RETURNING id INTO g_id;
        FOREACH grp IN ARRAY ARRAY['A','B','C'] LOOP
            INSERT INTO public.school_groups (grade_id, name) VALUES (g_id, grp) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    -- Preparatoria 1-3
    FOR i IN 1..3 LOOP
        INSERT INTO public.school_grades (level_id, name) VALUES (l_prepa, i::text) RETURNING id INTO g_id;
        FOREACH grp IN ARRAY ARRAY['A','B','C'] LOOP
            INSERT INTO public.school_groups (grade_id, name) VALUES (g_id, grp) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;


-- =====================================================================
-- 1.2) Vista de Hermanos (Asociación por Familia)
-- =====================================================================

CREATE OR REPLACE VIEW public.view_student_siblings AS
SELECT 
    s1.id AS student_id,
    s1.first_name || ' ' || s1.paternal_surname AS student_name,
    s2.id AS sibling_id,
    s2.first_name || ' ' || s2.paternal_surname AS sibling_name,
    s1.family_id
FROM public.students s1
JOIN public.students s2 ON s1.family_id = s2.family_id
WHERE s1.id <> s2.id;


-- =====================================================================
-- 2) Tabla de Familias y Tutores
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.families (
    id              BIGSERIAL PRIMARY KEY,
    family_number   VARCHAR(20), -- Núm. Familia
    family_name     VARCHAR(100), -- Familia (Apellidos)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 3) Tabla de tutores / padres de familia
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.guardians (
    id          BIGSERIAL PRIMARY KEY,
    full_name   TEXT        NOT NULL,
    phone       VARCHAR(30),
    email       TEXT,
    workplace   VARCHAR(100),
    occupation  VARCHAR(100),
    work_phone  VARCHAR(30),
    mobile_phone VARCHAR(30),
    is_mother   BOOLEAN DEFAULT FALSE,
    is_father   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guardians_email
    ON public.guardians (email)
    WHERE email IS NOT NULL;


-- =====================================================================
-- 4) Relación alumno–tutor (muchos a muchos)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.student_guardians (
    student_id   BIGINT      NOT NULL,
    guardian_id  BIGINT      NOT NULL,
    relationship VARCHAR(50), -- padre, madre, tutor, etc.
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, guardian_id),
    CONSTRAINT fk_sg_student
        FOREIGN KEY (student_id)
        REFERENCES public.students(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sg_guardian
        FOREIGN KEY (guardian_id)
        REFERENCES public.guardians(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_guardians_student
    ON public.student_guardians(student_id);

CREATE INDEX IF NOT EXISTS idx_student_guardians_guardian
    ON public.student_guardians(guardian_id);


-- =====================================================================
-- 4) Docentes
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.teachers (
    id          BIGSERIAL PRIMARY KEY,
    full_name   TEXT        NOT NULL,
    email       TEXT,
    phone       VARCHAR(30),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_email
    ON public.teachers (email)
    WHERE email IS NOT NULL;


-- =====================================================================
-- 5) Materias / cursos
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.courses (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,      -- Matemáticas, Español, etc.
    grade       VARCHAR(20) NOT NULL,      -- 1A, 2B, etc.
    teacher_id  BIGINT      NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_courses_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES public.teachers(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_courses_grade ON public.courses(grade);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);


-- =====================================================================
-- 6) Inscripciones alumno–curso
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.enrollments (
    id           BIGSERIAL PRIMARY KEY,
    student_id   BIGINT      NOT NULL,
    course_id    BIGINT      NOT NULL,
    enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id)
        REFERENCES public.students(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id)
        REFERENCES public.courses(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_enrollment_student_course
        UNIQUE (student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student
    ON public.enrollments(student_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course
    ON public.enrollments(course_id);


-- =====================================================================
-- 7) Asistencias
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.attendances (
    id          BIGSERIAL PRIMARY KEY,
    student_id  BIGINT      NOT NULL,
    course_id   BIGINT      NOT NULL,
    class_date  DATE        NOT NULL,
    status      CHAR(1)     NOT NULL, -- P = Presente, A = Ausente, R = Retardo
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_att_student
        FOREIGN KEY (student_id)
        REFERENCES public.students(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_att_course
        FOREIGN KEY (course_id)
        REFERENCES public.courses(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_attendance_unique
        UNIQUE (student_id, course_id, class_date),
    CONSTRAINT chk_att_status
        CHECK (status IN ('P', 'A', 'R'))
);

CREATE INDEX IF NOT EXISTS idx_attendances_student
    ON public.attendances(student_id);

CREATE INDEX IF NOT EXISTS idx_attendances_course
    ON public.attendances(course_id);

CREATE INDEX IF NOT EXISTS idx_attendances_date
    ON public.attendances(class_date);


-- =====================================================================
-- 8) Datos demo mínimos (opcional)
-- =====================================================================

INSERT INTO public.students (first_name, paternal_surname, current_grade, phone)
VALUES
    ('Ana', 'López', '1A', '555-111-2222'),
    ('Juan', 'Pérez', '1B', '555-222-3333'),
    ('María', 'García', '2A', NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.teachers (full_name, email, phone)
VALUES
    ('Profesor Matemáticas', 'mate@escuela.test', '555-444-5555'),
    ('Maestra Español',      'esp@escuela.test',  '555-666-7777')
ON CONFLICT DO NOTHING;



INSERT INTO public.courses (name, grade, teacher_id)
VALUES
    ('Matemáticas', '1A', 1),
    ('Español',     '1B', 2),
    ('Matemáticas', '2A', 1)
ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- PERFIL GENERAL DEL ESTUDIANTE
------------------------------------------------------------

-- Perfil general (una fila por estudiante)
CREATE TABLE student_profiles (
    id                  BIGSERIAL PRIMARY KEY,
    student_id          BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    -- IQ y forma de medición
    iq_score            numeric(5,2),
    iq_scale            text,              -- "WISC-IV", "Raven", etc.
    iq_assessed_at      date,

    -- Estilo de aprendizaje predominante
    learning_style      text,              -- 'visual','auditory','kinesthetic','mixed', etc.

    -- Niveles globales resumidos
    visual_level        int CHECK (visual_level BETWEEN 1 AND 5),
    math_level          int CHECK (math_level BETWEEN 1 AND 5),
    language_level      int CHECK (language_level BETWEEN 1 AND 5),

    -- Propuestas adicionales de perfil
    kinesthetic_level   int CHECK (kinesthetic_level BETWEEN 1 AND 5), -- aprende haciendo
    musical_level       int CHECK (musical_level BETWEEN 1 AND 5),
    social_level        int CHECK (social_level BETWEEN 1 AND 5),      -- trabajo en equipo
    self_management     int CHECK (self_management BETWEEN 1 AND 5),   -- organización, hábitos de estudio
    tech_affinity       int CHECK (tech_affinity BETWEEN 1 AND 5),     -- afinidad con tecnología
    creativity_level    int CHECK (creativity_level BETWEEN 1 AND 5),

    -- Preferencias generales de estudio
    preferred_study_time    text,          -- "morning","afternoon","night"
    preferred_modality      text,          -- "online","presencial","mixto"
    prefers_group_work      boolean,
    prefers_individual_work boolean,

    notes               text,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (student_id)
);


------------------------------------------------------------
-- CATÁLOGO DE DIMENSIONES DE PERFIL
------------------------------------------------------------

CREATE TABLE profile_dimensions (
    id          BIGSERIAL PRIMARY KEY,
    code        text UNIQUE NOT NULL, -- VISUAL, MATH, LANGUAGE, KINESTHETIC, MUSICAL, SOCIAL, INTRAPERSONAL, etc.
    name        text NOT NULL,
    category    text,                 -- 'cognitive','learning_style','socio_emotional', etc.
    description text
);

-- Algunos valores recomendados
INSERT INTO profile_dimensions (code, name, category, description) VALUES
    ('VISUAL',        'Visual',          'learning_style', 'Prefiere información por imágenes, diagramas y mapas.'),
    ('AUDITORY',      'Auditivo',        'learning_style', 'Prefiere explicaciones orales, audio, discusión.'),
    ('KINESTHETIC',   'Kinestésico',     'learning_style', 'Aprende mejor haciendo y manipulando.'),
    ('MATH',          'Lógico-matemático','cognitive',     'Habilidad para razonamiento lógico y numérico.'),
    ('LANGUAGE',      'Verbal-lingüístico','cognitive',    'Habilidad en lectura, escritura y expresión oral.'),
    ('SPATIAL',       'Espacial',        'cognitive',      'Habilidad para imaginar y manipular formas y espacios.'),
    ('MUSICAL',       'Musical',         'cognitive',      'Sensibilidad a ritmo, tono, melodía.'),
    ('SOCIAL',        'Interpersonal',   'socio_emotional','Habilidad para trabajar con otras personas.'),
    ('INTRAPERSONAL', 'Intrapersonal',   'socio_emotional','Autoconocimiento, manejo emocional.'),
    ('SELF_MGMT',     'Autogestión',     'habits',         'Organización, disciplina, manejo del tiempo.'),
    ('TECH',          'Afinidad tecnológica','habits',     'Comodidad usando herramientas digitales.')
ON CONFLICT (code) DO NOTHING;

------------------------------------------------------------
-- MEDICIONES POR DIMENSIÓN PARA CADA ESTUDIANTE
------------------------------------------------------------

CREATE TABLE student_dimension_scores (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    dimension_id    BIGINT NOT NULL REFERENCES profile_dimensions(id) ON DELETE CASCADE,
    score           int  NOT NULL CHECK (score BETWEEN 1 AND 5),
    assessed_at     date NOT NULL DEFAULT CURRENT_DATE,
    source          text,      -- prueba, observación, entrevista, etc.
    notes           text,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, dimension_id, assessed_at)
);

------------------------------------------------------------
-- CATÁLOGO DE INTERESES / GUSTOS
------------------------------------------------------------

CREATE TABLE interest_categories (
    id          BIGSERIAL PRIMARY KEY,
    code        text UNIQUE NOT NULL,    -- SPORTS, ARTS, TECH, READING, GAMES, SOCIAL, etc.
    name        text NOT NULL,
    description text
);

INSERT INTO interest_categories (code, name, description) VALUES
    ('SPORTS',   'Deportes',              'Actividades físicas y deportivas'),
    ('ARTS',     'Arte y creatividad',    'Dibujo, pintura, teatro, danza, etc.'),
    ('TECH',     'Tecnología y videojuegos','Computadoras, programación, gaming'),
    ('READING',  'Lectura y escritura',   'Novelas, cuentos, blogs, etc.'),
    ('MUSIC',    'Música',                'Escuchar, tocar instrumentos, cantar'),
    ('SCIENCE',  'Ciencia',               'Experimentos, naturaleza, curiosidad científica'),
    ('SOCIAL',   'Social',                'Actividades en grupo y convivencia')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE interests (
    id                  BIGSERIAL PRIMARY KEY,
    category_id         BIGINT NOT NULL REFERENCES interest_categories(id) ON DELETE CASCADE,
    name                text NOT NULL,      -- "Fútbol", "Cómics", "Programación", "TikTok", etc.
    description         text,
    is_active           boolean NOT NULL DEFAULT true,
    UNIQUE (category_id, name)
);

------------------------------------------------------------
-- INTERESES ASIGNADOS A CADA ESTUDIANTE
------------------------------------------------------------

CREATE TABLE student_interests (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    interest_id     BIGINT NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    preference_level int CHECK (preference_level BETWEEN 1 AND 5), -- qué tanto le gusta
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (student_id, interest_id)
);



-- =====================================================================
-- ROLES Y PERMISOS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL, -- Asumiendo que users.id es UUID por student_profiles
    role_id INT NOT NULL REFERENCES public.roles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Roles iniciales
INSERT INTO public.roles (name, description) VALUES
('admin', 'Administrador del sistema'),
('teacher', 'Docente'),
('student', 'Estudiante'),
('n8n_executor', 'Ejecutor de flujos N8N')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- N8N INTEGRATION
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.n8n_memory (
    id BIGSERIAL PRIMARY KEY,
    workflow_id VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workflow_id, key)
);

CREATE TABLE IF NOT EXISTS public.n8n_execution_logs (
    id BIGSERIAL PRIMARY KEY,
    workflow_id VARCHAR(100) NOT NULL,
    execution_id VARCHAR(100),
    status VARCHAR(20) NOT NULL, -- 'success', 'error', 'running'
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    output JSONB,
    error_details TEXT
);

-- =====================================================================
-- EXAMEN Y ACTIVIDADES - CATALOGOS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.question_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE, -- OPEN, SINGLE, BOOL, MULTI
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.question_types (code, name) VALUES
('OPEN', 'Respuesta Libre'),
('SINGLE', 'Opción Múltiple (Una correcta)'),
('BOOL', 'Falso/Verdadero'),
('MULTI', 'Opción Múltiple (Varias correctas)')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- N8N STAGING (GENERACIÓN DE POOLS)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.n8n_staging_pools (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES public.students(id) ON DELETE CASCADE, -- Opcional, si es personalizado
    topic TEXT,
    status VARCHAR(20) DEFAULT 'GENERATED', -- GENERATED, APPROVED, REJECTED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.n8n_staging_questions (
    id BIGSERIAL PRIMARY KEY,
    pool_id BIGINT NOT NULL REFERENCES public.n8n_staging_pools(id) ON DELETE CASCADE,
    question_type_code VARCHAR(20) REFERENCES public.question_types(code),
    question_text TEXT NOT NULL,
    options JSONB, -- Array de opciones para preguntas cerradas
    correct_answer JSONB, -- Respuesta correcta estructurada
    metadata JSONB, -- Para contexto extra de N8N
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- PRODUCCIÓN - ACTIVIDADES Y TAREAS
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.activities (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    activity_type VARCHAR(50), -- EXAM, HOMEWORK, PROJECT
    teacher_id BIGINT REFERENCES public.teachers(id),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_questions (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    question_type_code VARCHAR(20) REFERENCES public.question_types(code),
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer JSONB,
    points DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asignación a alumnos
CREATE TABLE IF NOT EXISTS public.student_activities (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    activity_id BIGINT NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ASSIGNED', -- ASSIGNED, SUBMITTED, GRADED
    final_grade DECIMAL(5,2),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- Respuestas de alumnos
CREATE TABLE IF NOT EXISTS public.student_activity_responses (
    id BIGSERIAL PRIMARY KEY,
    student_activity_id BIGINT NOT NULL REFERENCES public.student_activities(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES public.activity_questions(id),
    response_value JSONB, -- Lo que contestó el alumno
    is_correct BOOLEAN,
    points_awarded DECIMAL(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gestión de Archivos (Proyectos, Tareas, Evidencias)
CREATE TABLE IF NOT EXISTS public.activity_files (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT REFERENCES public.activities(id) ON DELETE CASCADE, -- Archivo adjunto por el maestro
    student_activity_id BIGINT REFERENCES public.student_activities(id) ON DELETE CASCADE, -- Tarea subida por alumno
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (activity_id IS NOT NULL OR student_activity_id IS NOT NULL)
);

-- =====================================================================
-- EXAMEN DE IQ
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.iq_tests (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    total_time_minutes  INT NOT NULL DEFAULT 45,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.iq_sections (
    id                  BIGSERIAL PRIMARY KEY,
    test_id             BIGINT NOT NULL REFERENCES public.iq_tests(id) ON DELETE CASCADE,
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    order_index         INT NOT NULL,
    time_limit_minutes  INT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_iq_sections UNIQUE(test_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.iq_questions (
    id              BIGSERIAL PRIMARY KEY,
    section_id      BIGINT NOT NULL REFERENCES public.iq_sections(id) ON DELETE CASCADE,
    text            TEXT NOT NULL,
    question_type   VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
    difficulty      INT NOT NULL DEFAULT 1,
    order_index     INT NOT NULL,
    score           INT NOT NULL DEFAULT 1,
    ability_domain  VARCHAR(50) NOT NULL,
    image_url       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_iq_questions UNIQUE(section_id, order_index)
);

CREATE TABLE IF NOT EXISTS public.iq_options (
    id              BIGSERIAL PRIMARY KEY,
    question_id     BIGINT NOT NULL REFERENCES public.iq_questions(id) ON DELETE CASCADE,
    option_key      VARCHAR(5) NOT NULL,
    text            TEXT NOT NULL,
    is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_iq_options UNIQUE(question_id, option_key)
);

CREATE TABLE IF NOT EXISTS public.iq_test_attempts (
    id                          BIGSERIAL PRIMARY KEY,
    student_id                  BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE, -- Linked to Student
    test_id                     BIGINT NOT NULL REFERENCES public.iq_tests(id) ON DELETE CASCADE,
    started_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at                TIMESTAMPTZ,
    raw_score                   INT,
    max_score                   INT,
    iq_score                    INT,
    percentile                  NUMERIC(5,2),
    verbal_score                INT,
    logic_score                 INT,
    math_score                  INT,
    visual_score                INT,
    memory_score                INT,
    speed_score                 INT
);

CREATE TABLE IF NOT EXISTS public.iq_answers (
    id                  BIGSERIAL PRIMARY KEY,
    attempt_id          BIGINT NOT NULL REFERENCES public.iq_test_attempts(id) ON DELETE CASCADE,
    question_id         BIGINT NOT NULL REFERENCES public.iq_questions(id) ON DELETE CASCADE,
    selected_option_id  BIGINT NOT NULL REFERENCES public.iq_options(id),
    is_correct          BOOLEAN NOT NULL,
    response_time_ms    INT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_iq_answers UNIQUE(attempt_id, question_id)
);

-- Insertar Datos de Ejemplo IQ
INSERT INTO public.iq_tests (name, description, total_time_minutes)
VALUES ('IQ General Adultos', 'Prueba de habilidades cognitivas generales', 40)
ON CONFLICT DO NOTHING;

-- Secciones y Preguntas de Ejemplo (usando DO block para obtener IDs dinámicos)
DO $$
DECLARE
    t_id BIGINT;
    s_logic BIGINT;
    q_id BIGINT;
BEGIN
    SELECT id INTO t_id FROM public.iq_tests WHERE name = 'IQ General Adultos' LIMIT 1;
    
    IF t_id IS NOT NULL THEN
        -- Secciones
        INSERT INTO public.iq_sections (test_id, name, description, order_index, time_limit_minutes)
        VALUES (t_id, 'Razonamiento Lógico', 'Patrones y secuencias lógicas', 1, 10)
        ON CONFLICT DO NOTHING
        RETURNING id INTO s_logic;

        -- Si ya existía, buscar ID
        IF s_logic IS NULL THEN
            SELECT id INTO s_logic FROM public.iq_sections WHERE test_id = t_id AND order_index = 1;
        END IF;

        -- Pregunta 1
        INSERT INTO public.iq_questions (section_id, text, difficulty, order_index, score, ability_domain)
        VALUES (s_logic, '¿Cuál número sigue en la serie? 2, 4, 8, 16, ?', 1, 1, 1, 'logic')
        ON CONFLICT DO NOTHING
        RETURNING id INTO q_id;

        IF q_id IS NOT NULL THEN
            INSERT INTO public.iq_options (question_id, option_key, text, is_correct) VALUES
            (q_id, 'A', '24', FALSE),
            (q_id, 'B', '30', FALSE),
            (q_id, 'C', '32', TRUE),
            (q_id, 'D', '34', FALSE)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- =====================================================================
-- SISTEMA DE CALIFICACIONES POR MATERIA
-- =====================================================================

-- Criterios de Calificación por Curso
CREATE TABLE IF NOT EXISTS public.course_grading_criteria (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL, -- 'HOMEWORK','EXAM','PROJECT','FINAL_EXAM','PARTIAL_EXAM'
    weight_percentage DECIMAL(5,2) NOT NULL CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, component_type)
);

-- Evaluaciones Específicas (instancias de cada componente)
CREATE TABLE IF NOT EXISTS public.course_evaluations (
    id BIGSERIAL PRIMARY KEY,
    criteria_id BIGINT NOT NULL REFERENCES public.course_grading_criteria(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    max_score DECIMAL(5,2) DEFAULT 100.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calificaciones de Alumnos por Evaluación
CREATE TABLE IF NOT EXISTS public.student_course_evaluations (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    evaluation_id BIGINT NOT NULL REFERENCES public.course_evaluations(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    feedback TEXT,
    graded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, evaluation_id)
);

CREATE INDEX IF NOT EXISTS idx_course_grading_criteria_course ON public.course_grading_criteria(course_id);
CREATE INDEX IF NOT EXISTS idx_course_evaluations_criteria ON public.course_evaluations(criteria_id);
CREATE INDEX IF NOT EXISTS idx_student_course_evaluations_student ON public.student_course_evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_course_evaluations_evaluation ON public.student_course_evaluations(evaluation_id);
