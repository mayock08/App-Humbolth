using Microsoft.EntityFrameworkCore;

namespace Backend.API.Data
{
    public class SupabaseDbContext : DbContext
    {
        public SupabaseDbContext(DbContextOptions<SupabaseDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Configure Supabase specific models here
        }
    }
}
