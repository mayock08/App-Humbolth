using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public CoursesController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/Courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses([FromQuery] int? periodId = null, [FromQuery] long? teacherId = null)
        {
            var query = _context.Courses
                .Include(c => c.Teacher)
                .Include(c => c.Period)
                .Include(c => c.Level)
                .Include(c => c.GradingCriteria)
                .AsQueryable();

            if (periodId.HasValue)
            {
                query = query.Where(c => c.PeriodId == periodId);
            }

            if (teacherId.HasValue)
            {
                query = query.Where(c => c.TeacherId == teacherId);
            }

            return await query.ToListAsync();
        }

        // GET: api/Courses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourse(long id)
        {
            var course = await _context.Courses
                .Include(c => c.Teacher)
                .Include(c => c.Level)
                .Include(c => c.GradingCriteria)
                    .ThenInclude(gc => gc.Evaluations)
                .Include(c => c.Enrollments)
                    .ThenInclude(e => e.Student)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound();
            }

            return course;
        }

        // POST: api/Courses
        [HttpPost]
        public async Task<ActionResult<Course>> PostCourse(Course course)
        {
            course.CreatedAt = DateTime.UtcNow;

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
        }

        // PUT: api/Courses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCourse(long id, Course course)
        {
            if (id != course.Id)
            {
                return BadRequest("ID mismatch");
            }

            var existingCourse = await _context.Courses.FindAsync(id);
            if (existingCourse == null)
            {
                return NotFound();
            }

            // Update only allowed fields
            existingCourse.Name = course.Name;
            existingCourse.Grade = course.Grade;
            existingCourse.TeacherId = course.TeacherId;
            existingCourse.Code = course.Code;
            existingCourse.Credits = course.Credits;
            existingCourse.ScheduleDays = course.ScheduleDays;
            existingCourse.StartTime = course.StartTime;
            existingCourse.EndTime = course.EndTime;
            existingCourse.PeriodId = course.PeriodId;
            existingCourse.LevelId = course.LevelId;
            // distinct from created_at which should remain unchanged

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Courses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(long id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CourseExists(long id)
        {
            return _context.Courses.Any(e => e.Id == id);
        }
    }
}
