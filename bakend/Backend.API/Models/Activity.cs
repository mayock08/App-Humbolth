using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace Backend.API.Models
{
    [Table("activities", Schema = "public")]
    public class Activity
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("activity_type")]
        [MaxLength(50)]
        public string? ActivityType { get; set; } // EXAM, HOMEWORK, PROJECT

        [Column("teacher_id")]
        public long? TeacherId { get; set; }

        [Column("is_published")]
        public bool IsPublished { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("TeacherId")]
        public Teacher? Teacher { get; set; }

        public ICollection<ActivityQuestion> Questions { get; set; } = new List<ActivityQuestion>();
        public ICollection<StudentActivity> StudentActivities { get; set; } = new List<StudentActivity>();
        public ICollection<ActivityFile> Files { get; set; } = new List<ActivityFile>();
    }

    [Table("activity_questions", Schema = "public")]
    public class ActivityQuestion
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("activity_id")]
        public long ActivityId { get; set; }

        [Column("question_type_code")]
        [MaxLength(20)]
        public string? QuestionTypeCode { get; set; }

        [Required]
        [Column("question_text")]
        public string QuestionText { get; set; } = string.Empty;

        [Column("options", TypeName = "jsonb")]
        public string? OptionsJson { get; set; }

        [Column("correct_answer", TypeName = "jsonb")]
        public string? CorrectAnswerJson { get; set; }

        [Column("points")]
        public decimal Points { get; set; } = 1.0m;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("ActivityId")]
        public Activity Activity { get; set; } = null!;

        public ICollection<StudentActivityResponse> StudentResponses { get; set; } = new List<StudentActivityResponse>();
    }

    [Table("student_activities", Schema = "public")]
    public class StudentActivity
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("activity_id")]
        public long ActivityId { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "ASSIGNED";

        [Column("final_grade")]
        public decimal? FinalGrade { get; set; }

        [Column("assigned_at")]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        [Column("submitted_at")]
        public DateTime? SubmittedAt { get; set; }

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("ActivityId")]
        public Activity Activity { get; set; } = null!;

        public ICollection<StudentActivityResponse> Responses { get; set; } = new List<StudentActivityResponse>();
        public ICollection<ActivityFile> Files { get; set; } = new List<ActivityFile>();
    }

    [Table("student_activity_responses", Schema = "public")]
    public class StudentActivityResponse
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_activity_id")]
        public long StudentActivityId { get; set; }

        [Column("question_id")]
        public long QuestionId { get; set; }

        [Column("response_value", TypeName = "jsonb")]
        public string? ResponseValueJson { get; set; }

        [Column("is_correct")]
        public bool? IsCorrect { get; set; }

        [Column("points_awarded")]
        public decimal? PointsAwarded { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentActivityId")]
        public StudentActivity StudentActivity { get; set; } = null!;

        [ForeignKey("QuestionId")]
        public ActivityQuestion Question { get; set; } = null!;
    }

    [Table("activity_files", Schema = "public")]
    public class ActivityFile
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("activity_id")]
        public long? ActivityId { get; set; }

        [Column("student_activity_id")]
        public long? StudentActivityId { get; set; }

        [Required]
        [Column("file_url")]
        public string FileUrl { get; set; } = string.Empty;

        [Column("file_name")]
        [MaxLength(255)]
        public string? FileName { get; set; }

        [Column("file_type")]
        [MaxLength(50)]
        public string? FileType { get; set; }

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("ActivityId")]
        public Activity? Activity { get; set; }

        [ForeignKey("StudentActivityId")]
        public StudentActivity? StudentActivity { get; set; }
    }
}
