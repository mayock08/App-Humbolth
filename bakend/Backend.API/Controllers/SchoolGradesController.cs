using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchoolGradesController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public SchoolGradesController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/SchoolGrades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SchoolGrade>>> GetSchoolGrades()
        {
            return await _context.SchoolGrades
                .Include(g => g.Groups)
                .ToListAsync();
        }

        // GET: api/SchoolGrades/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SchoolGrade>> GetSchoolGrade(int id)
        {
            var schoolGrade = await _context.SchoolGrades
                .Include(g => g.Groups)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (schoolGrade == null)
            {
                return NotFound();
            }

            return schoolGrade;
        }

        // POST: api/SchoolGrades
        [HttpPost]
        public async Task<ActionResult<SchoolGrade>> PostSchoolGrade(SchoolGrade schoolGrade)
        {
            // Ensure LevelId is valid
            if (!_context.SchoolLevels.Any(l => l.Id == schoolGrade.LevelId))
            {
                return BadRequest("Invalid LevelId.");
            }

            schoolGrade.CreatedAt = DateTime.UtcNow;

            _context.SchoolGrades.Add(schoolGrade);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSchoolGrade), new { id = schoolGrade.Id }, schoolGrade);
        }

        // PUT: api/SchoolGrades/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSchoolGrade(int id, SchoolGrade schoolGrade)
        {
            if (id != schoolGrade.Id)
            {
                return BadRequest();
            }

            _context.Entry(schoolGrade).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SchoolGradeExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/SchoolGrades/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchoolGrade(int id)
        {
            var schoolGrade = await _context.SchoolGrades.FindAsync(id);
            if (schoolGrade == null)
            {
                return NotFound();
            }

            _context.SchoolGrades.Remove(schoolGrade);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SchoolGradeExists(int id)
        {
            return _context.SchoolGrades.Any(e => e.Id == id);
        }
    }
}
