using Microsoft.EntityFrameworkCore;

namespace Backend.API.Data
{
    public class AwsDbContext : DbContext
    {
        public AwsDbContext(DbContextOptions<AwsDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Configure AWS specific models here
        }
    }
}
