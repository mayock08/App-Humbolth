using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;
using System.Net.Http;
using System.Text.Json;
using System.Text;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class N8NController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public N8NController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/N8N/logs
        [HttpGet("logs")]
        public async Task<ActionResult<IEnumerable<N8nExecutionLog>>> GetLogs([FromQuery] string? status, [FromQuery] int limit = 50)
        {
            var query = _context.N8nExecutionLogs.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(l => l.Status == status);
            }

            return await query.OrderByDescending(l => l.StartedAt).Take(limit).ToListAsync();
        }

        // GET: api/N8N/logs/5
        [HttpGet("logs/{id}")]
        public async Task<ActionResult<N8nExecutionLog>> GetLog(long id)
        {
            var log = await _context.N8nExecutionLogs.FindAsync(id);
            if (log == null)
            {
                return NotFound();
            }
            return log;
        }

        // POST: api/N8N/logs
        [HttpPost("logs")]
        public async Task<ActionResult<N8nExecutionLog>> PostLog(N8nExecutionLog log)
        {
            log.StartedAt = DateTime.UtcNow;
            _context.N8nExecutionLogs.Add(log);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetLog), new { id = log.Id }, log);
        }

        // PUT: api/N8N/logs/5
        [HttpPut("logs/{id}")]
        public async Task<IActionResult> PutLog(long id, N8nExecutionLog log)
        {
            if (id != log.Id)
            {
                return BadRequest();
            }
            _context.Entry(log).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.N8nExecutionLogs.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }
            return NoContent();
        }

        // GET: api/N8N/pools
        [HttpGet("pools")]
        public async Task<ActionResult<IEnumerable<N8nStagingPool>>> GetPools()
        {
            return await _context.N8nStagingPools
                .Include(p => p.Student)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        // GET: api/N8N/pools/5
        [HttpGet("pools/{id}")]
        public async Task<ActionResult<N8nStagingPool>> GetPool(long id)
        {
            var pool = await _context.N8nStagingPools
                .Include(p => p.Student)
                .Include(p => p.Questions)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pool == null)
            {
                return NotFound();
            }
            return pool;
        }

        // POST: api/N8N/pools
        [HttpPost("pools")]
        public async Task<ActionResult<N8nStagingPool>> PostPool(N8nStagingPool pool)
        {
            pool.CreatedAt = DateTime.UtcNow;
            _context.N8nStagingPools.Add(pool);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPool), new { id = pool.Id }, pool);
        }
        // POST: api/N8N/chat
        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] N8nChatRequest request)
        {
            try
            {
                // TODO: Move this URL to appsettings.json
                // Placeholder URL for N8N Webhook
                string n8nWebhookUrl = "https://your-n8n-instance.com/webhook/educational-chat";

                var payload = new
                {
                    message = request.Message,
                    userId = request.UserId,
                    role = "Admin",
                    timestamp = DateTime.UtcNow
                };

                var jsonPayload = System.Text.Json.JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

                using var client = new HttpClient();
                var response = await client.PostAsync(n8nWebhookUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    var responseText = await response.Content.ReadAsStringAsync();
                    // Assuming N8N returns just the text answer or a JSON with "text" property
                    // For now, let's return it directly
                    return Ok(new { response = responseText });
                }
                else
                {
                    return StatusCode((int)response.StatusCode, "Error contacting AI service");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class N8nChatRequest
    {
        public string Message { get; set; }
        public string UserId { get; set; }
    }
}
