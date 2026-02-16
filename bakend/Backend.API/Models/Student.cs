using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("students", Schema = "public")]
    public class Student
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        // Datos Básicos
        [Column("matricula")]
        [MaxLength(50)]
        public string? Matricula { get; set; }

        [Required]
        [Column("first_name")]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [Column("paternal_surname")]
        [MaxLength(100)]
        public string PaternalSurname { get; set; } = string.Empty;

        [Column("maternal_surname")]
        [MaxLength(100)]
        public string? MaternalSurname { get; set; }

        [Column("gender")]
        [MaxLength(20)]
        public string? Gender { get; set; }

        [Column("birth_date")]
        public DateTime? BirthDate { get; set; }

        [Column("birth_place")]
        [MaxLength(100)]
        public string? BirthPlace { get; set; }

        [Column("nationality")]
        [MaxLength(50)]
        public string? Nationality { get; set; }

        [Column("marital_status")]
        [MaxLength(20)]
        public string? MaritalStatus { get; set; }

        [Column("curp")]
        [MaxLength(20)]
        public string? Curp { get; set; }

        [Column("photo_url")]
        public string? PhotoUrl { get; set; }

        // Domicilio
        [Column("street_address")]
        [MaxLength(200)]
        public string? StreetAddress { get; set; }

        [Column("cross_streets")]
        [MaxLength(200)]
        public string? CrossStreets { get; set; }

        [Column("city")]
        [MaxLength(100)]
        public string? City { get; set; }

        [Column("state")]
        [MaxLength(100)]
        public string? State { get; set; }

        [Column("zip_code")]
        [MaxLength(10)]
        public string? ZipCode { get; set; }

        [Column("email")]
        [MaxLength(100)]
        public string? Email { get; set; }

        [Column("alternate_email")]
        [MaxLength(100)]
        public string? AlternateEmail { get; set; }

        [Column("phone")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        // Escolaridad
        [Column("education_level")]
        [MaxLength(50)]
        public string? EducationLevel { get; set; }

        [Column("current_grade")]
        [MaxLength(20)]
        public string? CurrentGrade { get; set; }

        [Column("current_group")]
        [MaxLength(10)]
        public string? CurrentGroup { get; set; }

        [Column("internal_id")]
        [MaxLength(20)]
        public string? InternalId { get; set; }

        [Column("official_id")]
        [MaxLength(20)]
        public string? OfficialId { get; set; }

        // Status
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "Activo";

        [Column("admission_date")]
        public DateTime? AdmissionDate { get; set; }

        [Column("admission_cycle")]
        [MaxLength(50)]
        public string? AdmissionCycle { get; set; }

        // Notas
        [Column("notes")]
        public string? Notes { get; set; }

        [Column("observations")]
        public string? Observations { get; set; }

        // Timestamps
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Keys
        [Column("family_id")]
        public long? FamilyId { get; set; }

        [Column("group_id")]
        public int? GroupId { get; set; }

        // Navigation Properties
        [ForeignKey("FamilyId")]
        public Family? Family { get; set; }

        [ForeignKey("GroupId")]
        public SchoolGroup? Group { get; set; }

        public ICollection<StudentGuardian> StudentGuardians { get; set; } = new List<StudentGuardian>();
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public ICollection<StudentActivity> StudentActivities { get; set; } = new List<StudentActivity>();
        public ICollection<IqTestAttempt> IqTestAttempts { get; set; } = new List<IqTestAttempt>();

        [Column("iq_score")]
        public int? IqScore { get; set; }
    }
}
