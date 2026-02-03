using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActivitiesController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public ActivitiesController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/Activities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Activity>>> GetActivities()
        {
            return await _context.Activities
                .Include(a => a.Teacher)
                .Include(a => a.Questions)
                .ToListAsync();
        }

        // GET: api/Activities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Activity>> GetActivity(long id)
        {
            var activity = await _context.Activities
                .Include(a => a.Teacher)
                .Include(a => a.Questions)
                .Include(a => a.StudentActivities)
                    .ThenInclude(sa => sa.Student)
                .Include(a => a.Files)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (activity == null)
            {
                return NotFound();
            }

            return activity;
        }

        // POST: api/Activities
        [HttpPost]
        public async Task<ActionResult<Activity>> PostActivity(Activity activity)
        {
            activity.CreatedAt = DateTime.UtcNow;

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetActivity), new { id = activity.Id }, activity);
        }

        // PUT: api/Activities/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutActivity(long id, Activity activity)
        {
            if (id != activity.Id)
            {
                return BadRequest();
            }

            _context.Entry(activity).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ActivityExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Activities/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(long id)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null)
            {
                return NotFound();
            }

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Activities/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentActivity>>> GetStudentActivities(long studentId)
        {
            return await _context.StudentActivities
                .Include(sa => sa.Activity)
                .Include(sa => sa.Activity.Teacher)
                .Where(sa => sa.StudentId == studentId)
                .OrderByDescending(sa => sa.AssignedAt)
                .ToListAsync();
        }

        private bool ActivityExists(long id)
        {
            return _context.Activities.Any(e => e.Id == id);
        }
    }
}
