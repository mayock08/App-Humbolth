using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.API.Models
{
    [Table("teachers", Schema = "public")]
    public class Teacher
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("full_name")]
        public string FullName { get; set; } = string.Empty;

        [Column("email")]
        public string? Email { get; set; }

        [Column("phone")]
        [MaxLength(30)]
        public string? Phone { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<Course> Courses { get; set; } = new List<Course>();
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    }

    [Table("courses", Schema = "public")]
    public class Course
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("grade")]
        [MaxLength(20)]
        public string Grade { get; set; } = string.Empty;

        [Column("teacher_id")]
        public long TeacherId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("TeacherId")]
        public Teacher Teacher { get; set; } = null!;

        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
        public ICollection<CourseGradingCriteria> GradingCriteria { get; set; } = new List<CourseGradingCriteria>();
    }

    [Table("enrollments", Schema = "public")]
    public class Enrollment
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("course_id")]
        public long CourseId { get; set; }

        [Column("enrolled_at")]
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("CourseId")]
        public Course Course { get; set; } = null!;
    }

    [Table("attendances", Schema = "public")]
    public class Attendance
    {
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Column("student_id")]
        public long StudentId { get; set; }

        [Column("course_id")]
        public long CourseId { get; set; }

        [Column("class_date")]
        public DateTime ClassDate { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(1)]
        public string Status { get; set; } = string.Empty; // P, A, R

        [Column("note")]
        public string? Note { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("StudentId")]
        public Student Student { get; set; } = null!;

        [ForeignKey("CourseId")]
        public Course Course { get; set; } = null!;
    }
}
