using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("guardians", Schema = "public")]
    public class Guardian
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Column("phone")]
        [MaxLength(30)]
        public string? Phone { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("password_hash")]
        public string? PasswordHash { get; set; }

        [Column("workplace")]
        [MaxLength(100)]
        public string? Workplace { get; set; }

        [Column("occupation")]
        [MaxLength(100)]
        public string? Occupation { get; set; }

        [Column("work_phone")]
        [MaxLength(30)]
        public string? WorkPhone { get; set; }

        [Column("mobile_phone")]
        [MaxLength(30)]
        public string? MobilePhone { get; set; }

        [Column("is_mother")]
        public bool IsMother { get; set; } = false;

        [Column("is_father")]
        public bool IsFather { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<StudentGuardian> StudentGuardians { get; set; } = new List<StudentGuardian>();
    }

    [Table("student_guardians", Schema = "public")]
    public class StudentGuardian
    {
        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("guardian_id")]
        public long GuardianId { get; set; }

        [Column("relationship")]
        [MaxLength(50)]
        public string? Relationship { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("GuardianId")]
        public Guardian Guardian { get; set; } = null!;
    }
}
