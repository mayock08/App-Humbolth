"""Attendance management data model for students and teachers.

This module contains a small in-memory model that could be used as the
foundation for persisting the information in a database or an API layer.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from enum import Enum
from typing import Dict, List, Optional


class PeriodType(str, Enum):
    """Available periods for tracking attendance."""

    SEMESTRAL = "semestral"
    BIMESTRAL = "bimestral"
    ANUAL = "anual"


@dataclass(slots=True)
class Period:
    """Represents a period of time when attendance is tracked."""

    period_type: PeriodType
    name: str
    start: date
    end: date

    def contains(self, target_date: date) -> bool:
        """Return True if the date is within this period."""

        return self.start <= target_date <= self.end


@dataclass(slots=True)
class Teacher:
    """Teacher profile with complementary information."""

    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    department: Optional[str]
    licenciatura: Optional[str]
    grado_academico: Optional[str]
    especialidad: Optional[str]


@dataclass(slots=True)
class Student:
    id: str
    first_name: str
    last_name: str
    email: str
    enrollment_year: int
    career: Optional[str]


@dataclass(slots=True)
class AttendanceRecord:
    """Attendance information per participant and date."""

    person_id: str
    period: Period
    session_date: date
    present: bool
    justification: Optional[str] = None
    recorded_by: Optional[str] = None  # Teacher identifier


class AttendanceModel:
    """In-memory registry for attendance."""

    def __init__(self) -> None:
        self.teachers: Dict[str, Teacher] = {}
        self.students: Dict[str, Student] = {}
        self.periods: Dict[str, Period] = {}
        self.records: List[AttendanceRecord] = []

    # ---- Teacher management -------------------------------------------------
    def add_teacher(self, teacher: Teacher) -> None:
        if teacher.id in self.teachers:
            raise ValueError(f"Teacher {teacher.id} already exists")
        self.teachers[teacher.id] = teacher

    # ---- Student management -------------------------------------------------
    def add_student(self, student: Student) -> None:
        if student.id in self.students:
            raise ValueError(f"Student {student.id} already exists")
        self.students[student.id] = student

    # ---- Period management --------------------------------------------------
    def add_period(self, period: Period) -> None:
        if period.name in self.periods:
            raise ValueError(f"Period {period.name} already exists")
        self.periods[period.name] = period

    def get_period_for_date(self, target_date: date) -> Optional[Period]:
        for period in self.periods.values():
            if period.contains(target_date):
                return period
        return None

    # ---- Attendance ---------------------------------------------------------
    def register_attendance(
        self,
        person_id: str,
        session_date: date,
        present: bool,
        justification: Optional[str] = None,
        recorded_by: Optional[str] = None,
    ) -> AttendanceRecord:
        period = self.get_period_for_date(session_date)
        if period is None:
            raise ValueError("No period defined for the provided date")

        if person_id not in self.students and person_id not in self.teachers:
            raise ValueError("Unknown person identifier")

        record = AttendanceRecord(
            person_id=person_id,
            period=period,
            session_date=session_date,
            present=present,
            justification=justification,
            recorded_by=recorded_by,
        )
        self.records.append(record)
        return record

    def list_attendance_for_period(self, period_name: str) -> List[AttendanceRecord]:
        if period_name not in self.periods:
            raise ValueError("Unknown period")
        return [record for record in self.records if record.period.name == period_name]


__all__ = [
    "PeriodType",
    "Period",
    "Teacher",
    "Student",
    "AttendanceRecord",
    "AttendanceModel",
]
