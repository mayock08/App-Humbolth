using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterestsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public InterestsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/Interests/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<InterestCategory>>> GetCategories()
        {
            return await _context.InterestCategories.ToListAsync();
        }

        // GET: api/Interests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Interest>>> GetInterests()
        {
            return await _context.Interests
                .Include(i => i.Category)
                .Where(i => i.IsActive)
                .ToListAsync();
        }

        // GET: api/Interests/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentInterest>>> GetStudentInterests(long studentId)
        {
            return await _context.StudentInterests
                .Include(si => si.Interest)
                    .ThenInclude(i => i.Category)
                .Where(si => si.StudentId == studentId)
                .ToListAsync();
        }

        // POST: api/Interests/student
        [HttpPost("student")]
        public async Task<ActionResult<StudentInterest>> PostStudentInterest(StudentInterest studentInterest)
        {
            studentInterest.CreatedAt = DateTime.UtcNow;

            var existing = await _context.StudentInterests
                .FirstOrDefaultAsync(si => si.StudentId == studentInterest.StudentId && si.InterestId == studentInterest.InterestId);

            if (existing != null)
            {
                existing.PreferenceLevel = studentInterest.PreferenceLevel;
                existing.Notes = studentInterest.Notes;
                _context.Entry(existing).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return Ok(existing);
            }

            _context.StudentInterests.Add(studentInterest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStudentInterests), new { studentId = studentInterest.StudentId }, studentInterest);
        }

        // DELETE: api/Interests/student/5
        [HttpDelete("student/{id}")]
        public async Task<IActionResult> DeleteStudentInterest(long id)
        {
            var studentInterest = await _context.StudentInterests.FindAsync(id);
            if (studentInterest == null)
            {
                return NotFound();
            }

            _context.StudentInterests.Remove(studentInterest);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
