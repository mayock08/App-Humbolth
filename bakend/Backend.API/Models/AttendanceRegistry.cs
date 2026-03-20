using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("attendance_registries", Schema = "public")]
    public class AttendanceRegistry
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("course_id")]
        public long CourseId { get; set; }

        [Column("school_period_id")]
        public int? SchoolPeriodId { get; set; }

        [Required]
        [Column("registry_date")]
        public DateTime RegistryDate { get; set; }

        [Required]
        [Column("teacher_id")]
        public long TeacherId { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("observation")]
        public string? Observation { get; set; }

        // Navigation Properties
        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        [ForeignKey("SchoolPeriodId")]
        public SchoolPeriod? SchoolPeriod { get; set; }

        [ForeignKey("TeacherId")]
        public Teacher? Teacher { get; set; }
    }
}
