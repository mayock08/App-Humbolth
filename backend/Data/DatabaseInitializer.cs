using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Data;

public class DatabaseInitializer(AppDbContext context, ILogger<DatabaseInitializer> logger)
{
    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await context.Database.MigrateAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating or initializing the database.");
            throw;
        }
    }
}
