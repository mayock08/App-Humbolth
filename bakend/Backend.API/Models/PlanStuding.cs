using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("plan_studings", Schema = "public")]
    public class PlanStuding
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("period_id")]
        public int PeriodId { get; set; }

        [Column("attachment_url")]
        public string? AttachmentUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PeriodId")]
        public SchoolPeriod? Period { get; set; }

        public ICollection<PlanStudingCourse> PlanCourses { get; set; } = new List<PlanStudingCourse>();
    }

    [Table("plan_studing_courses", Schema = "public")]
    public class PlanStudingCourse
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("plan_studing_id")]
        public int PlanStudingId { get; set; }

        [Column("course_id")]
        public long CourseId { get; set; }

        [Column("is_official_sep")]
        public bool IsOfficialSep { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PlanStudingId")]
        public PlanStuding? PlanStuding { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }
    }
}
