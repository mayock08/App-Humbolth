using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("profile_dimensions", Schema = "public")]
    public class ProfileDimension
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("code")]
        public string Code { get; set; } = string.Empty;

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("category")]
        public string? Category { get; set; }

        [Column("description")]
        public string? Description { get; set; }
    }

    [Table("student_dimension_scores", Schema = "public")]
    public class StudentDimensionScore
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("dimension_id")]
        public long DimensionId { get; set; }

        [Column("score")]
        public int Score { get; set; }

        [Column("assessed_at")]
        public DateTime AssessedAt { get; set; } = DateTime.UtcNow.Date;

        [Column("source")]
        public string? Source { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("DimensionId")]
        public ProfileDimension Dimension { get; set; } = null!;
    }

    [Table("interest_categories", Schema = "public")]
    public class InterestCategory
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("code")]
        public string Code { get; set; } = string.Empty;

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }
    }

    [Table("interests", Schema = "public")]
    public class Interest
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("category_id")]
        public long CategoryId { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        // Navigation Properties
        [ForeignKey("CategoryId")]
        public InterestCategory Category { get; set; } = null!;
    }

    [Table("student_interests", Schema = "public")]
    public class StudentInterest
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("interest_id")]
        public long InterestId { get; set; }

        [Column("preference_level")]
        public int? PreferenceLevel { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("InterestId")]
        public Interest Interest { get; set; } = null!;
    }
}
