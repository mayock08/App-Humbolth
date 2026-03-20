using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchoolPeriodsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public SchoolPeriodsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/SchoolPeriods
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SchoolPeriod>>> GetSchoolPeriods()
        {
            // Fetch root periods (no parent) and include their immediate sub-periods
            return await _context.SchoolPeriods
                .Include(p => p.Level)
                .Include(p => p.SubPeriods)
                .Where(p => p.ParentPeriodId == null)
                .ToListAsync();
        }

        // GET: api/SchoolPeriods/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SchoolPeriod>> GetSchoolPeriod(int id)
        {
            var schoolPeriod = await _context.SchoolPeriods
                .Include(p => p.Level)
                .Include(p => p.SubPeriods)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (schoolPeriod == null)
            {
                return NotFound();
            }

            return schoolPeriod;
        }

        // GET: api/SchoolPeriods/active
        [HttpGet("active")]
        public async Task<ActionResult<SchoolPeriod>> GetActivePeriod([FromQuery] int? levelId = null)
        {
            var query = _context.SchoolPeriods.Include(p => p.Level).Where(p => p.IsActive);
            
            if (levelId.HasValue)
            {
                query = query.Where(p => p.LevelId == levelId.Value);
            }

            var activePeriod = await query.FirstOrDefaultAsync();

            if (activePeriod == null)
            {
                // Optional: Return the latest one if no active period is set?
                // Or just NotFound or NoContent.
                // Let's return NotFound for now, the frontend should handle it.
                return NotFound("No active school period found.");
            }

            return activePeriod;
        }

        // PUT: api/SchoolPeriods/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSchoolPeriod(int id, SchoolPeriod schoolPeriod)
        {
            if (id != schoolPeriod.Id)
            {
                return BadRequest();
            }

            // Validation: Dates must be within parent dates
            if (schoolPeriod.ParentPeriodId.HasValue)
            {
                var parent = await _context.SchoolPeriods.AsNoTracking().FirstOrDefaultAsync(p => p.Id == schoolPeriod.ParentPeriodId.Value);
                if (parent == null) return BadRequest("Parent period not found.");

                if (schoolPeriod.StartDate < parent.StartDate || schoolPeriod.EndDate > parent.EndDate)
                {
                    return BadRequest("La fecha del sub-periodo debe estar dentro del rango de fechas del periodo padre.");
                }
                
                // Prevent circular references
                if (schoolPeriod.ParentPeriodId.Value == schoolPeriod.Id)
                    return BadRequest("Un periodo no puede ser su propio padre.");
            }

            _context.Entry(schoolPeriod).State = EntityState.Modified;

            // If setting this to active, deactivate others in the same level that share the SAME parent
            // This allows a Parent Year to be active alongside ONE of its child Trimesters.
            if (schoolPeriod.IsActive)
            {
                var otherActivePeriods = await _context.SchoolPeriods
                    .Where(p => p.IsActive && p.Id != id && p.LevelId == schoolPeriod.LevelId && p.ParentPeriodId == schoolPeriod.ParentPeriodId)
                    .ToListAsync();

                foreach (var p in otherActivePeriods)
                {
                    p.IsActive = false;
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SchoolPeriodExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // POST: api/SchoolPeriods
        [HttpPost]
        public async Task<ActionResult<SchoolPeriod>> PostSchoolPeriod(SchoolPeriod schoolPeriod)
        {
            // Validation: Dates must be within parent dates
            if (schoolPeriod.ParentPeriodId.HasValue)
            {
                var parent = await _context.SchoolPeriods.FindAsync(schoolPeriod.ParentPeriodId.Value);
                if (parent == null) return BadRequest("Parent period not found.");

                if (schoolPeriod.StartDate < parent.StartDate || schoolPeriod.EndDate > parent.EndDate)
                {
                    return BadRequest("La fecha del sub-periodo debe estar dentro del rango de fechas del periodo padre.");
                }
            }

            // If setting this to active, deactivate others in the same level that share the SAME parent
            if (schoolPeriod.IsActive)
            {
                var otherActivePeriods = await _context.SchoolPeriods
                    .Where(p => p.IsActive && p.LevelId == schoolPeriod.LevelId && p.ParentPeriodId == schoolPeriod.ParentPeriodId)
                    .ToListAsync();

                foreach (var p in otherActivePeriods)
                {
                    p.IsActive = false;
                }
            }
            
            schoolPeriod.CreatedAt = DateTime.UtcNow;
            _context.SchoolPeriods.Add(schoolPeriod);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSchoolPeriod", new { id = schoolPeriod.Id }, schoolPeriod);
        }

        // DELETE: api/SchoolPeriods/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchoolPeriod(int id)
        {
            var schoolPeriod = await _context.SchoolPeriods.FindAsync(id);
            if (schoolPeriod == null)
            {
                return NotFound();
            }

            _context.SchoolPeriods.Remove(schoolPeriod);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SchoolPeriodExists(int id)
        {
            return _context.SchoolPeriods.Any(e => e.Id == id);
        }
    }
}
