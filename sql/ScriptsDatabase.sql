-- OPCIONAL: crea la base si trabajas fuera de Supabase
-- CREATE DATABASE "EscolarDB";

-- =====================================================================
-- 1) Tabla principal de alumnos
--    (corresponde al modelo Student de .NET: Id, Name, Grade, GuardianPhone)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.students (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT        NOT NULL,
    grade           VARCHAR(20) NOT NULL,
    guardian_phone  VARCHAR(30)
);

CREATE INDEX IF NOT EXISTS idx_students_grade ON public.students(grade);


-- =====================================================================
-- 2) Tabla de tutores / padres de familia
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.guardians (
    id          BIGSERIAL PRIMARY KEY,
    full_name   TEXT        NOT NULL,
    phone       VARCHAR(30),
    email       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guardians_email
    ON public.guardians (email)
    WHERE email IS NOT NULL;


-- =====================================================================
-- 3) Relación alumno–tutor (muchos a muchos)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.student_guardians (
    student_id   BIGINT      NOT NULL,
    guardian_id  BIGINT      NOT NULL,
    relationship VARCHAR(50), -- padre, madre, tutor, etc.
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

INSERT INTO public.students (name, grade, guardian_phone)
VALUES
    ('Ana López',  '1A', '555-111-2222'),
    ('Juan Pérez', '1B', '555-222-3333'),
    ('María García','2A', NULL)
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
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    updated_at          timestamptz NOT NULL DEFAULT now(),

    UNIQUE (student_id)
);


------------------------------------------------------------
-- CATÁLOGO DE DIMENSIONES DE PERFIL
------------------------------------------------------------

CREATE TABLE profile_dimensions (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dimension_id    uuid NOT NULL REFERENCES profile_dimensions(id) ON DELETE CASCADE,
    score           int  NOT NULL CHECK (score BETWEEN 1 AND 5),
    assessed_at     date NOT NULL DEFAULT CURRENT_DATE,
    source          text,      -- prueba, observación, entrevista, etc.
    notes           text,
    UNIQUE (student_id, dimension_id, assessed_at)
);

------------------------------------------------------------
-- CATÁLOGO DE INTERESES / GUSTOS
------------------------------------------------------------

CREATE TABLE interest_categories (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id         uuid NOT NULL REFERENCES interest_categories(id) ON DELETE CASCADE,
    name                text NOT NULL,      -- "Fútbol", "Cómics", "Programación", "TikTok", etc.
    description         text,
    is_active           boolean NOT NULL DEFAULT true,
    UNIQUE (category_id, name)
);

------------------------------------------------------------
-- INTERESES ASIGNADOS A CADA ESTUDIANTE
------------------------------------------------------------

CREATE TABLE student_interests (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_id     uuid NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    preference_level int CHECK (preference_level BETWEEN 1 AND 5), -- qué tanto le gusta
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (student_id, interest_id)
);


