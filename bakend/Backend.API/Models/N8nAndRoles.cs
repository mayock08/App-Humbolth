using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("roles", Schema = "public")]
    public class Role
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("n8n_memory", Schema = "public")]
    public class N8nMemory
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("workflow_id")]
        [MaxLength(100)]
        public string WorkflowId { get; set; } = string.Empty;

        [Required]
        [Column("key")]
        [MaxLength(100)]
        public string Key { get; set; } = string.Empty;

        [Column("value", TypeName = "jsonb")]
        public string? ValueJson { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("n8n_execution_logs", Schema = "public")]
    public class N8nExecutionLog
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("workflow_id")]
        [MaxLength(100)]
        public string WorkflowId { get; set; } = string.Empty;

        [Column("execution_id")]
        [MaxLength(100)]
        public string? ExecutionId { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty;

        [Column("started_at")]
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        [Column("ended_at")]
        public DateTime? EndedAt { get; set; }

        [Column("output", TypeName = "jsonb")]
        public string? OutputJson { get; set; }

        [Column("error_details")]
        public string? ErrorDetails { get; set; }
    }

    [Table("n8n_staging_pools", Schema = "public")]
    public class N8nStagingPool
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long? StudentId { get; set; }

        [Column("topic")]
        public string? Topic { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "GENERATED";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student? Student { get; set; }

        public ICollection<N8nStagingQuestion> Questions { get; set; } = new List<N8nStagingQuestion>();
    }

    [Table("n8n_staging_questions", Schema = "public")]
    public class N8nStagingQuestion
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("pool_id")]
        public long PoolId { get; set; }

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

        [Column("metadata", TypeName = "jsonb")]
        public string? MetadataJson { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PoolId")]
        public N8nStagingPool Pool { get; set; } = null!;
    }
}
