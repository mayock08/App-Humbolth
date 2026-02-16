using Microsoft.EntityFrameworkCore;
using Backend.API.Models;

namespace Backend.API.Data
{
    public class SupabaseDbContext : DbContext
    {
        public SupabaseDbContext(DbContextOptions<SupabaseDbContext> options) : base(options)
        {
        }

        // Core Entities
        public DbSet<Student> Students { get; set; }
        public DbSet<Family> Families { get; set; }
        public DbSet<Guardian> Guardians { get; set; }
        public DbSet<StudentGuardian> StudentGuardians { get; set; }

        // School Catalogs
        public DbSet<SchoolLevel> SchoolLevels { get; set; }
        public DbSet<SchoolGrade> SchoolGrades { get; set; }
        public DbSet<SchoolGroup> SchoolGroups { get; set; }

        // Courses
        public DbSet<Teacher> Teachers { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Attendance> Attendances { get; set; }

        // Grading
        public DbSet<CourseGradingCriteria> CourseGradingCriteria { get; set; }
        public DbSet<CourseEvaluation> CourseEvaluations { get; set; }
        public DbSet<StudentCourseEvaluation> StudentCourseEvaluations { get; set; }

        // Activities
        public DbSet<Activity> Activities { get; set; }
        public DbSet<ActivityQuestion> ActivityQuestions { get; set; }
        public DbSet<StudentActivity> StudentActivities { get; set; }
        public DbSet<StudentActivityResponse> StudentActivityResponses { get; set; }
        public DbSet<ActivityFile> ActivityFiles { get; set; }

        // IQ Tests
        public DbSet<IqTest> IqTests { get; set; }
        public DbSet<IqSection> IqSections { get; set; }
        public DbSet<IqQuestion> IqQuestions { get; set; }
        public DbSet<IqOption> IqOptions { get; set; }
        public DbSet<IqTestAttempt> IqTestAttempts { get; set; }
        public DbSet<IqAnswer> IqAnswers { get; set; }

        // Student Profiling
        public DbSet<ProfileDimension> ProfileDimensions { get; set; }
        public DbSet<StudentDimensionScore> StudentDimensionScores { get; set; }
        public DbSet<InterestCategory> InterestCategories { get; set; }
        public DbSet<Interest> Interests { get; set; }
        public DbSet<StudentInterest> StudentInterests { get; set; }

        // Question Pools
        public DbSet<QuestionPool> QuestionPools { get; set; }
        public DbSet<PoolQuestion> PoolQuestions { get; set; }

        // N8N & Roles
        public DbSet<Role> Roles { get; set; }
        public DbSet<N8nMemory> N8nMemories { get; set; }
        public DbSet<N8nExecutionLog> N8nExecutionLogs { get; set; }
        public DbSet<N8nStagingPool> N8nStagingPools { get; set; }
        public DbSet<N8nStagingQuestion> N8nStagingQuestions { get; set; }
        
        // Incidents
        public DbSet<IncidentType> IncidentTypes { get; set; }

        public DbSet<StudentIncident> StudentIncidents { get; set; }

        // Coordinators
        public DbSet<Coordinator> Coordinators { get; set; }
        public DbSet<CoordinatorGroup> CoordinatorGroups { get; set; }

        // Notifications
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<IqTestGroup> IqTestGroups { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure composite keys
            modelBuilder.Entity<StudentGuardian>()
                .HasKey(sg => new { sg.StudentId, sg.GuardianId });

            // Configure unique constraints
            modelBuilder.Entity<N8nMemory>()
                .HasIndex(m => new { m.WorkflowId, m.Key })
                .IsUnique();

            modelBuilder.Entity<IqAnswer>()
                .HasIndex(a => new { a.AttemptId, a.QuestionId })
                .IsUnique();

            modelBuilder.Entity<StudentCourseEvaluation>()
                .HasIndex(e => new { e.StudentId, e.EvaluationId })
                .IsUnique();

            modelBuilder.Entity<CoordinatorGroup>()
                .HasIndex(cg => new { cg.CoordinatorId, cg.GroupId })
                .IsUnique();

            // Configure decimal precision
            modelBuilder.Entity<CourseGradingCriteria>()
                .Property(c => c.WeightPercentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<CourseEvaluation>()
                .Property(e => e.MaxScore)
                .HasPrecision(5, 2);

            modelBuilder.Entity<StudentCourseEvaluation>()
                .Property(e => e.Score)
                .HasPrecision(5, 2);

            modelBuilder.Entity<ActivityQuestion>()
                .Property(q => q.Points)
                .HasPrecision(5, 2);

            modelBuilder.Entity<StudentActivity>()
                .Property(a => a.FinalGrade)
                .HasPrecision(5, 2);

            modelBuilder.Entity<StudentActivityResponse>()
                .Property(r => r.PointsAwarded)
                .HasPrecision(5, 2);

            modelBuilder.Entity<IqTestAttempt>()
                .Property(a => a.Percentile)
                .HasPrecision(5, 2);
        }
    }
}
