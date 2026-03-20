using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("school_levels", Schema = "public")]
    public class SchoolLevel
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<SchoolGrade> Grades { get; set; } = new List<SchoolGrade>();
    }

    [Table("school_grades", Schema = "public")]
    public class SchoolGrade
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("level_id")]
        public int LevelId { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(20)]
        public string Name { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("LevelId")]
        public SchoolLevel Level { get; set; } = null!;

        public ICollection<SchoolGroup> Groups { get; set; } = new List<SchoolGroup>();
    }

    [Table("school_groups", Schema = "public")]
    public class SchoolGroup
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("grade_id")]
        public int GradeId { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(10)]
        public string Name { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("GradeId")]
        public SchoolGrade? Grade { get; set; }

        public ICollection<Student> Students { get; set; } = new List<Student>();

        [Column("teacher_id")]
        public long? TeacherId { get; set; }

        [ForeignKey("TeacherId")]
        public Teacher? Teacher { get; set; }

        public ICollection<SchoolGroupTeacher> GroupTeachers { get; set; } = new List<SchoolGroupTeacher>();
    }

    [Table("school_group_teachers", Schema = "public")]
    public class SchoolGroupTeacher
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("school_group_id")]
        public int SchoolGroupId { get; set; }

        [Column("teacher_id")]
        public long TeacherId { get; set; }

        [Column("role")]
        [MaxLength(50)]
        public string? Role { get; set; } // "Titular", "Auxiliar", etc.

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("SchoolGroupId")]
        public SchoolGroup? SchoolGroup { get; set; }

        [ForeignKey("TeacherId")]
        public Teacher? Teacher { get; set; }
    }
}
