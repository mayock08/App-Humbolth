using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("student_documents", Schema = "public")]
    public class StudentDocument
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Required]
        [Column("document_type")]
        [MaxLength(100)]
        public string DocumentType { get; set; } = string.Empty; // "Acta de Nacimiento", "CURP", etc.

        [Required]
        [Column("file_name")]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Column("file_path")]
        [MaxLength(500)]
        public string? FilePath { get; set; } // Path on server or URL

        [Column("file_type")]
        [MaxLength(50)]
        public string? FileType { get; set; } // MIME type: application/pdf, image/jpeg

        [Column("file_size")]
        public long FileSize { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Under Review

        [Column("rejection_reason")]
        public string? RejectionReason { get; set; }

        [Column("uploaded_at")]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [Column("reviewed_at")]
        public DateTime? ReviewedAt { get; set; }

        [Column("reviewed_by")]
        [MaxLength(100)]
        public string? ReviewedBy { get; set; }

        // Navigation
        [ForeignKey("StudentId")]
        public Student? Student { get; set; }
    }
}
