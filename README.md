# App-Humbolth

Este repositorio contiene un modelo simple para administrar la asistencia de
alumnos y profesores. La lógica está escrita en Python e incluye:

- Registro detallado de docentes con datos complementarios como licenciatura y
  grado académico.
- Control de alumnos y periodos (semestral, bimestral y anual).
- Registro de asistencias por fecha, incluyendo ausencias justificadas.

## Uso rápido

```python
from datetime import date
from attendance_model import (
    AttendanceModel,
    Period,
    PeriodType,
    Student,
    Teacher,
)

model = AttendanceModel()

model.add_teacher(
    Teacher(
        id="T-001",
        first_name="Ana",
        last_name="Pérez",
        email="ana@example.com",
        phone="555-0100",
        department="Matemáticas",
        licenciatura="Matemáticas",
        grado_academico="Maestría",
        especialidad="Estadística",
    )
)

model.add_student(
    Student(
        id="S-001",
        first_name="Luis",
        last_name="Ramírez",
        email="luis@example.com",
        enrollment_year=2023,
        career="Ingeniería",
    )
)

model.add_period(
    Period(
        period_type=PeriodType.SEMESTRAL,
        name="2024-1",
        start=date(2024, 1, 15),
        end=date(2024, 6, 15),
    )
)

model.register_attendance(
    person_id="S-001",
    session_date=date(2024, 3, 20),
    present=True,
    recorded_by="T-001",
)
```

El modelo funciona completamente en memoria, por lo que se puede usar como base
para una API o persistencia en base de datos.
