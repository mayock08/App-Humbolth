using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Student>(entity =>
        {
            entity.ToTable("students");

            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.FullName)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.PaternalLastName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.MaternalLastName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.FatherFullName)
                .HasMaxLength(200)
                .IsRequired(false);

            entity.Property(e => e.MotherFullName)
                .HasMaxLength(200)
                .IsRequired(false);

            entity.Property(e => e.Email)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.HealthStatus)
                .HasMaxLength(200)
                .IsRequired(false);

            entity.Property(e => e.BloodType)
                .HasMaxLength(10)
                .IsRequired(false);

            entity.Property(e => e.ChronicIllnessDetails)
                .HasMaxLength(500)
                .IsRequired(false);

            entity.Property(e => e.ConcurrentContactNames)
                .HasMaxLength(500)
                .IsRequired(false);

            entity.Property(e => e.Observations)
                .HasMaxLength(1000)
                .IsRequired(false);

            entity.HasIndex(e => e.Email)
                .IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW() AT TIME ZONE 'UTC'");
        });
    }
}
