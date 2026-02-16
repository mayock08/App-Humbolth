using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace Backend.API.Models
{
    [Table("question_pools", Schema = "public")]
    public class QuestionPool
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("teacher_id")]
        public long TeacherId { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<PoolQuestion> Questions { get; set; } = new List<PoolQuestion>();
        
        [ForeignKey("TeacherId")]
        public Teacher? Teacher { get; set; }
    }

    [Table("pool_questions", Schema = "public")]
    public class PoolQuestion
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("pool_id")]
        public long PoolId { get; set; }

        [Required]
        [Column("question_text")]
        public string QuestionText { get; set; } = string.Empty;

        [Required]
        [Column("question_type")]
        [MaxLength(50)]
        public string QuestionType { get; set; } = "multiple_choice";

        [Column("options_json", TypeName = "jsonb")]
        public string? OptionsJson { get; set; }

        [Column("correct_answer_json", TypeName = "jsonb")]
        public string? CorrectAnswerJson { get; set; }

        [Column("points")]
        public decimal Points { get; set; } = 1.0m;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("PoolId")]
        public QuestionPool Pool { get; set; } = null!;
    }
}
