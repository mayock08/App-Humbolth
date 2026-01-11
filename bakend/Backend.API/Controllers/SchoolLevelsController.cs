using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchoolLevelsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public SchoolLevelsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/SchoolLevels
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SchoolLevel>>> GetSchoolLevels()
        {
            return await _context.SchoolLevels
                .Include(l => l.Grades)
                    .ThenInclude(g => g.Groups)
                .ToListAsync();
        }

        // GET: api/SchoolLevels/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SchoolLevel>> GetSchoolLevel(int id)
        {
            var schoolLevel = await _context.SchoolLevels
                .Include(l => l.Grades)
                    .ThenInclude(g => g.Groups)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (schoolLevel == null)
            {
                return NotFound();
            }

            return schoolLevel;
        }

        // POST: api/SchoolLevels
        [HttpPost]
        public async Task<ActionResult<SchoolLevel>> PostSchoolLevel(SchoolLevel schoolLevel)
        {
            schoolLevel.CreatedAt = DateTime.UtcNow;

            _context.SchoolLevels.Add(schoolLevel);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSchoolLevel), new { id = schoolLevel.Id }, schoolLevel);
        }

        // PUT: api/SchoolLevels/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSchoolLevel(int id, SchoolLevel schoolLevel)
        {
            if (id != schoolLevel.Id)
            {
                return BadRequest();
            }

            _context.Entry(schoolLevel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SchoolLevelExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/SchoolLevels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchoolLevel(int id)
        {
            var schoolLevel = await _context.SchoolLevels.FindAsync(id);
            if (schoolLevel == null)
            {
                return NotFound();
            }

            _context.SchoolLevels.Remove(schoolLevel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SchoolLevelExists(int id)
        {
            return _context.SchoolLevels.Any(e => e.Id == id);
        }
    }
}
