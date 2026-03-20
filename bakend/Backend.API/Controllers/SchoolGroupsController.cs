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
                .Include(g => g.Grade)
                    .ThenInclude(gr => gr.Level)
                .Include(g => g.Students)
                .Include(g => g.GroupTeachers)
                    .ThenInclude(gt => gt.Teacher)
                .Include(g => g.Teacher) // Keep for backward compatibility if needed, but we should migrate
                .ToListAsync();
        }

        // GET: api/SchoolGroups/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SchoolGroup>> GetSchoolGroup(int id)
        {
            var schoolGroup = await _context.SchoolGroups
                .Include(g => g.Students)
                .Include(g => g.GroupTeachers)
                    .ThenInclude(gt => gt.Teacher)
                .Include(g => g.Teacher)
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

            var existingGroup = await _context.SchoolGroups
                .Include(g => g.GroupTeachers)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (existingGroup == null)
            {
                return NotFound();
            }

            // Update properties
            existingGroup.Name = schoolGroup.Name;
            existingGroup.GradeId = schoolGroup.GradeId;
            
            // Update GroupTeachers
            // We assume that if the payload contains GroupTeachers, we replace the list.
            // If the payload comes from a client that doesn't know about GroupTeachers, it might be empty.
            // But since we initialized it in the model, it's safer to check if there are explicit changes.
            // For now, we will replace if the list is sent (count >= 0).
            
            // Clear existing relationships
            existingGroup.GroupTeachers.Clear();

            // Add new relationships
            if (schoolGroup.GroupTeachers != null)
            {
                foreach (var gt in schoolGroup.GroupTeachers)
                {
                    // Ensure the Teacher exists? We assume ID is valid or EF will throw FK error.
                    // We need to create NEW instances to avoid tracking issues if schoolGroup was tracked (it's not, it's param)
                    existingGroup.GroupTeachers.Add(new SchoolGroupTeacher
                    {
                        TeacherId = gt.TeacherId,
                        Role = gt.Role,
                        SchoolGroupId = id,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            // Legacy support: Sync TeacherId
            // If there's a Titular, use that. Otherwise use the first one, or null.
            var titular = existingGroup.GroupTeachers.FirstOrDefault(t => t.Role == "Titular");
            if (titular != null)
            {
                existingGroup.TeacherId = titular.TeacherId;
            }
            else 
            {
                // If no titular, check if there's any teacher
                 var firstTeacher = existingGroup.GroupTeachers.FirstOrDefault();
                 existingGroup.TeacherId = firstTeacher?.TeacherId;
            }

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
