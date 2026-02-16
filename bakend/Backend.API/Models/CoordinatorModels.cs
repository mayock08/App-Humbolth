using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("coordinators", Schema = "public")]
    public class Coordinator
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("full_name")]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Column("email")]
        [MaxLength(100)]
        public string? Email { get; set; }

        [Column("password_hash")]
        public string? PasswordHash { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<CoordinatorGroup> Assignments { get; set; } = new List<CoordinatorGroup>();
    }

    [Table("coordinator_groups", Schema = "public")]
    public class CoordinatorGroup
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("coordinator_id")]
        public long CoordinatorId { get; set; }

        [Column("group_id")]
        public int GroupId { get; set; }

        [Column("assigned_at")]
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [ForeignKey("CoordinatorId")]
        public Coordinator Coordinator { get; set; } = null!;

        [ForeignKey("GroupId")]
        public SchoolGroup Group { get; set; } = null!;
    }
}
