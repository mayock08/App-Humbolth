using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    public static class SubmissionType
    {
        public const string FileUpload = "FileUpload";
        public const string OnlineText = "OnlineText";
        public const string ExternalLink = "ExternalLink";
        public const string Multimedia = "Multimedia";
        public const string Discussion = "Discussion";
        public const string Checklist = "Checklist";
    }

    [Table("course_tasks", Schema = "public")]
    public class CourseTask
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("course_id")]
        public long CourseId { get; set; }

        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [Column("submission_type")]
        [MaxLength(50)]
        public string SubmissionType { get; set; } = Models.SubmissionType.FileUpload;

        [Column("max_score")]
        public decimal MaxScore { get; set; } = 100.0m;

        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        [Column("checklist_items_json", TypeName = "jsonb")]
        public string? ChecklistItemsJson { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("period_id")]
        public int? PeriodId { get; set; }

        // Navigation
        [ForeignKey("PeriodId")]
        public SchoolPeriod? Period { get; set; }
        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        public ICollection<TaskSubmission> Submissions { get; set; } = new List<TaskSubmission>();
    }

    [Table("task_submissions", Schema = "public")]
    public class TaskSubmission
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("course_task_id")]
        public long CourseTaskId { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "ASSIGNED";

        [Column("submission_date")]
        public DateTime? SubmissionDate { get; set; }

        [Column("text_response")]
        public string? TextResponse { get; set; }

        [Column("file_url")]
        public string? FileUrl { get; set; }

        [Column("checklist_responses_json", TypeName = "jsonb")]
        public string? ChecklistResponsesJson { get; set; }

        [Column("grade")]
        public decimal? Grade { get; set; }

        [Column("teacher_feedback")]
        public string? TeacherFeedback { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [ForeignKey("CourseTaskId")]
        public CourseTask? CourseTask { get; set; }

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }
    }
}
