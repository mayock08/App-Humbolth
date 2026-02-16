using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("incident_types", Schema = "public")]
    public class IncidentType
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("severity")]
        [MaxLength(50)]
        public string Severity { get; set; } = string.Empty; // Leve, Grave, Muy Grave

        [Column("description")]
        public string? Description { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("student_incidents", Schema = "public")]
    public class StudentIncident
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("type_id")]
        public int TypeId { get; set; }

        [Column("reporter_id")]
        public long? ReporterId { get; set; }

        [Column("date")]
        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "Abierto"; // Abierto, En Revisión, Resuelto

        [Column("action_taken")]
        public string? ActionTaken { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("TypeId")]
        public IncidentType Type { get; set; } = null!;

        [ForeignKey("ReporterId")]
        public Teacher? Reporter { get; set; }
    }
}
