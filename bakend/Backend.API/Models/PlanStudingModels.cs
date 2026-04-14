using System;
using System.Collections.Generic;

namespace Backend.API.Models
{
    public class PlanStudingDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int PeriodId { get; set; }
        public string? PeriodName { get; set; }
        public string? AttachmentUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<PlanStudingCourseDto> Courses { get; set; } = new();
    }

    public class CreatePlanStudingDto
    {
        public string Name { get; set; } = string.Empty;
        public int PeriodId { get; set; }
        public string? AttachmentUrl { get; set; }
    }

    public class PlanStudingCourseDto
    {
        public int Id { get; set; }
        public long CourseId { get; set; }
        public string? CourseName { get; set; }
        public string? Grade { get; set; }
        public bool IsOfficialSep { get; set; }
    }

    public class AddCourseToPlanDto
    {
        public long CourseId { get; set; }
        public bool IsOfficialSep { get; set; }
    }
}
