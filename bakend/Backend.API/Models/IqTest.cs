using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("iq_tests", Schema = "public")]
    public class IqTest
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("total_time_minutes")]
        public int TotalTimeMinutes { get; set; } = 45;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<IqSection> Sections { get; set; } = new List<IqSection>();
        public ICollection<IqTestAttempt> Attempts { get; set; } = new List<IqTestAttempt>();
    }

    [Table("iq_sections", Schema = "public")]
    public class IqSection
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("test_id")]
        public long TestId { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("order_index")]
        public int OrderIndex { get; set; }

        [Column("time_limit_minutes")]
        public int? TimeLimitMinutes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("TestId")]
        public IqTest Test { get; set; } = null!;

        public ICollection<IqQuestion> Questions { get; set; } = new List<IqQuestion>();
    }

    [Table("iq_questions", Schema = "public")]
    public class IqQuestion
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("section_id")]
        public long SectionId { get; set; }

        [Required]
        [Column("text")]
        public string Text { get; set; } = string.Empty;

        [Column("question_type")]
        [MaxLength(50)]
        public string QuestionType { get; set; } = "multiple_choice";

        [Column("difficulty")]
        public int Difficulty { get; set; } = 1;

        [Column("order_index")]
        public int OrderIndex { get; set; }

        [Column("score")]
        public int Score { get; set; } = 1;

        [Required]
        [Column("ability_domain")]
        [MaxLength(50)]
        public string AbilityDomain { get; set; } = string.Empty;

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("SectionId")]
        public IqSection Section { get; set; } = null!;

        public ICollection<IqOption> Options { get; set; } = new List<IqOption>();
        public ICollection<IqAnswer> Answers { get; set; } = new List<IqAnswer>();
    }

    [Table("iq_options", Schema = "public")]
    public class IqOption
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("question_id")]
        public long QuestionId { get; set; }

        [Required]
        [Column("option_key")]
        [MaxLength(5)]
        public string OptionKey { get; set; } = string.Empty;

        [Required]
        [Column("text")]
        public string Text { get; set; } = string.Empty;

        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("is_correct")]
        public bool IsCorrect { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("QuestionId")]
        public IqQuestion Question { get; set; } = null!;
    }

    [Table("iq_test_attempts", Schema = "public")]
    public class IqTestAttempt
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("test_id")]
        public long TestId { get; set; }

        [Column("started_at")]
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [Column("raw_score")]
        public int? RawScore { get; set; }

        [Column("max_score")]
        public int? MaxScore { get; set; }

        [Column("iq_score")]
        public int? IqScore { get; set; }

        [Column("percentile")]
        public decimal? Percentile { get; set; }

        [Column("verbal_score")]
        public int? VerbalScore { get; set; }

        [Column("logic_score")]
        public int? LogicScore { get; set; }

        [Column("math_score")]
        public int? MathScore { get; set; }

        [Column("visual_score")]
        public int? VisualScore { get; set; }

        [Column("memory_score")]
        public int? MemoryScore { get; set; }

        [Column("speed_score")]
        public int? SpeedScore { get; set; }

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("TestId")]
        public IqTest Test { get; set; } = null!;

        public ICollection<IqAnswer> Answers { get; set; } = new List<IqAnswer>();
    }

    [Table("iq_answers", Schema = "public")]
    public class IqAnswer
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("attempt_id")]
        public long AttemptId { get; set; }

        [Column("question_id")]
        public long QuestionId { get; set; }

        [Column("selected_option_id")]
        public long SelectedOptionId { get; set; }

        [Column("is_correct")]
        public bool IsCorrect { get; set; }

        [Column("response_time_ms")]
        public int? ResponseTimeMs { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("AttemptId")]
        public IqTestAttempt Attempt { get; set; } = null!;

        [ForeignKey("QuestionId")]
        public IqQuestion Question { get; set; } = null!;

        [ForeignKey("SelectedOptionId")]
        public IqOption SelectedOption { get; set; } = null!;
    }
}
