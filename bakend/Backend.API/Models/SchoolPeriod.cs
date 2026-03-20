using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("school_periods", Schema = "public")]
    public class SchoolPeriod
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty; // e.g., "2025-2026 A"

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("level_id")]
        public int? LevelId { get; set; }

        [Column("parent_period_id")]
        public int? ParentPeriodId { get; set; }

        [Column("period_type")]
        [MaxLength(20)]
        public string PeriodType { get; set; } = "Year"; // "Year", "Semester", "Trimester", "Quarter"

        [Column("weight")]
        public decimal Weight { get; set; } = 1.0m; // Example: 0.33 for a trimester

        // Navigation Properties
        [ForeignKey("LevelId")]
        public SchoolLevel? Level { get; set; }

        [ForeignKey("ParentPeriodId")]
        public SchoolPeriod? ParentPeriod { get; set; }

        public ICollection<SchoolPeriod> SubPeriods { get; set; } = new List<SchoolPeriod>();

        public ICollection<Course> Courses { get; set; } = new List<Course>();
    }
}
