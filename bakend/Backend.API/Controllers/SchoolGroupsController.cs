using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchoolGroupsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public SchoolGroupsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/SchoolGroups
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SchoolGroup>>> GetSchoolGroups()
        {
            return await _context.SchoolGroups
                .Include(g => g.Students)
                .ToListAsync();
        }

        // GET: api/SchoolGroups/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SchoolGroup>> GetSchoolGroup(int id)
        {
            var schoolGroup = await _context.SchoolGroups
                .Include(g => g.Students)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (schoolGroup == null)
            {
                return NotFound();
            }

            return schoolGroup;
        }

        // POST: api/SchoolGroups
        [HttpPost]
        public async Task<ActionResult<SchoolGroup>> PostSchoolGroup(SchoolGroup schoolGroup)
        {
            // Ensure GradeId is valid
            if (!_context.SchoolGrades.Any(g => g.Id == schoolGroup.GradeId))
            {
                return BadRequest("Invalid GradeId.");
            }

            schoolGroup.CreatedAt = DateTime.UtcNow;

            _context.SchoolGroups.Add(schoolGroup);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSchoolGroup), new { id = schoolGroup.Id }, schoolGroup);
        }

        // PUT: api/SchoolGroups/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSchoolGroup(int id, SchoolGroup schoolGroup)
        {
            if (id != schoolGroup.Id)
            {
                return BadRequest();
            }

            _context.Entry(schoolGroup).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SchoolGroupExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/SchoolGroups/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchoolGroup(int id)
        {
            var schoolGroup = await _context.SchoolGroups.FindAsync(id);
            if (schoolGroup == null)
            {
                return NotFound();
            }

            _context.SchoolGroups.Remove(schoolGroup);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SchoolGroupExists(int id)
        {
            return _context.SchoolGroups.Any(e => e.Id == id);
        }
    }
}
