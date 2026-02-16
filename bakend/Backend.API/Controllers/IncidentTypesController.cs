using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IncidentTypesController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public IncidentTypesController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/IncidentTypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IncidentType>>> GetIncidentTypes()
        {
            return await _context.IncidentTypes.ToListAsync();
        }

        // GET: api/IncidentTypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IncidentType>> GetIncidentType(int id)
        {
            var incidentType = await _context.IncidentTypes.FindAsync(id);

            if (incidentType == null)
            {
                return NotFound();
            }

            return incidentType;
        }

        // POST: api/IncidentTypes
        [HttpPost]
        public async Task<ActionResult<IncidentType>> PostIncidentType(IncidentType incidentType)
        {
            // Validate Severity
            var validSeverities = new[] { "Leve", "Grave", "Muy Grave" };
            if (!validSeverities.Contains(incidentType.Severity))
            {
                return BadRequest("Invalid Severity. Allowed values: Leve, Grave, Muy Grave.");
            }

            incidentType.CreatedAt = DateTime.UtcNow;

            _context.IncidentTypes.Add(incidentType);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetIncidentType), new { id = incidentType.Id }, incidentType);
        }

        // PUT: api/IncidentTypes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutIncidentType(int id, IncidentType incidentType)
        {
            if (id != incidentType.Id)
            {
                return BadRequest();
            }

            // Validate Severity if it's being updated
            var validSeverities = new[] { "Leve", "Grave", "Muy Grave" };
            if (!validSeverities.Contains(incidentType.Severity))
            {
                return BadRequest("Invalid Severity. Allowed values: Leve, Grave, Muy Grave.");
            }

            _context.Entry(incidentType).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IncidentTypeExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/IncidentTypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIncidentType(int id)
        {
            var incidentType = await _context.IncidentTypes.FindAsync(id);
            if (incidentType == null)
            {
                return NotFound();
            }

            _context.IncidentTypes.Remove(incidentType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool IncidentTypeExists(int id)
        {
            return _context.IncidentTypes.Any(e => e.Id == id);
        }
    }
}
