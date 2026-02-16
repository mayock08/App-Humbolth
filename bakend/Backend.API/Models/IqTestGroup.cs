using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("iq_test_groups", Schema = "public")]
    public class IqTestGroup
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("test_id")]
        public long TestId { get; set; }

        [Column("group_id")]
        public int GroupId { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("TestId")]
        public IqTest Test { get; set; } = null!;

        [ForeignKey("GroupId")]
        public SchoolGroup Group { get; set; } = null!;
    }
}
