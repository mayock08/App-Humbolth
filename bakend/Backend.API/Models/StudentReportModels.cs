using System;
using System.Collections.Generic;

namespace Backend.API.Models
{
    public class StudentGradeReportDto
    {
        public long StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string Matricula { get; set; } = string.Empty;
        public decimal GeneralAverage { get; set; }
        public bool HasParentEmail { get; set; }
        public string ParentEmail { get; set; } = string.Empty;
        public List<CourseGradeDto> Courses { get; set; } = new();
    }

    public class CourseGradeDto
    {
        public string CourseName { get; set; } = string.Empty;
        public string FormativeFieldName { get; set; } = string.Empty;
        public decimal Score { get; set; }
        public DateTime? GradedAt { get; set; }
    }

    public class BulkEmailRequestDto
    {
        public int PeriodId { get; set; }
        public List<long> StudentIds { get; set; } = new();
    }
}
