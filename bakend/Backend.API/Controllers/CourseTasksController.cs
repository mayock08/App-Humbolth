using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseTasksController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public CourseTasksController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/CourseTasks/course/5
        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<CourseTask>>> GetTasksForCourse(long courseId)
        {
            return await _context.CourseTasks
                .Where(t => t.CourseId == courseId)
                .OrderBy(t => t.DueDate)
                .ToListAsync();
        }

        // GET: api/CourseTasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CourseTask>> GetCourseTask(long id)
        {
            var courseTask = await _context.CourseTasks.FindAsync(id);

            if (courseTask == null)
            {
                return NotFound();
            }

            return courseTask;
        }

        // POST: api/CourseTasks
        [HttpPost]
        public async Task<ActionResult<CourseTask>> PostCourseTask(CourseTask courseTask)
        {
            _context.CourseTasks.Add(courseTask);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCourseTask", new { id = courseTask.Id }, courseTask);
        }

        // PUT: api/CourseTasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCourseTask(long id, CourseTask courseTask)
        {
            if (id != courseTask.Id)
            {
                return BadRequest();
            }

            _context.Entry(courseTask).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseTaskExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/CourseTasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourseTask(long id)
        {
            var courseTask = await _context.CourseTasks.FindAsync(id);
            if (courseTask == null)
            {
                return NotFound();
            }

            _context.CourseTasks.Remove(courseTask);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CourseTaskExists(long id)
        {
            return _context.CourseTasks.Any(e => e.Id == id);
        }
    }
}
