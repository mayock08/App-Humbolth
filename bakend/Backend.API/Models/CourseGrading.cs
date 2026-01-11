using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("course_grading_criteria", Schema = "public")]
    public class CourseGradingCriteria
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("course_id")]
        public long CourseId { get; set; }

        [Required]
        [Column("component_type")]
        [MaxLength(50)]
        public string ComponentType { get; set; } = string.Empty; // HOMEWORK, EXAM, PROJECT, etc.

        [Column("weight_percentage")]
        public decimal WeightPercentage { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("CourseId")]
        public Course Course { get; set; } = null!;

        public ICollection<CourseEvaluation> Evaluations { get; set; } = new List<CourseEvaluation>();
    }

    [Table("course_evaluations", Schema = "public")]
    public class CourseEvaluation
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("criteria_id")]
        public long CriteriaId { get; set; }

        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("max_score")]
        public decimal MaxScore { get; set; } = 100.0m;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("CriteriaId")]
        public CourseGradingCriteria Criteria { get; set; } = null!;

        public ICollection<StudentCourseEvaluation> StudentEvaluations { get; set; } = new List<StudentCourseEvaluation>();
    }

    [Table("student_course_evaluations", Schema = "public")]
    public class StudentCourseEvaluation
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("evaluation_id")]
        public long EvaluationId { get; set; }

        [Column("score")]
        public decimal? Score { get; set; }

        [Column("feedback")]
        public string? Feedback { get; set; }

        [Column("graded_at")]
        public DateTime? GradedAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("EvaluationId")]
        public CourseEvaluation Evaluation { get; set; } = null!;
    }
}
