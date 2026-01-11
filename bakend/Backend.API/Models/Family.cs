using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("families", Schema = "public")]
    public class Family
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("family_number")]
        [MaxLength(20)]
        public string? FamilyNumber { get; set; }

        [Column("family_name")]
        [MaxLength(100)]
        public string? FamilyName { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<Student> Students { get; set; } = new List<Student>();
    }
}
