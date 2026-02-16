-- =============================================
-- School Incidents System
-- =============================================

-- 1. Incident Types Catalog
CREATE TABLE IF NOT EXISTS public.incident_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'Leve', 'Grave', 'Muy Grave'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial Data for Incident Types
INSERT INTO public.incident_types (name, severity, description) VALUES
('Retardo', 'Leve', 'Llegada tarde a clase'),
('Uniforme Incompleto', 'Leve', 'No portar el uniforme correctamente'),
('Falta de Tarea', 'Leve', 'No entregar la tarea asignada'),
('Indisciplina en Clase', 'Leve', 'Interrumpir la clase o distraer a compañeros'),
('Uso de Celular', 'Leve', 'Uso no autorizado de dispositivo móvil'),
('Agresión Verbal', 'Grave', 'Insultos o lenguaje inapropiado hacia compañeros o personal'),
('Daño a Propiedad', 'Grave', 'Dau00f1o intencional o accidental a mobiliario o equipo'),
('Agresión Física', 'Muy Grave', 'Cualquier tipo de contacto físico violento');

-- 2. Student Incidents (Reports)
CREATE TABLE IF NOT EXISTS public.student_incidents (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    type_id INT NOT NULL,
    reporter_id BIGINT, -- Teacher ID
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Abierto', -- 'Abierto', 'En Revisión', 'Resuelto'
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_student_incident FOREIGN KEY (student_id) REFERENCES public.students(id),
    CONSTRAINT fk_type_incident FOREIGN KEY (type_id) REFERENCES public.incident_types(id),
    CONSTRAINT fk_reporter_incident FOREIGN KEY (reporter_id) REFERENCES public.teachers(id)
);

CREATE INDEX idx_student_incidents_student ON public.student_incidents(student_id);
CREATE INDEX idx_student_incidents_date ON public.student_incidents(date);
