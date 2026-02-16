using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public EnrollmentsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/Enrollments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Enrollment>>> GetEnrollments()
        {
            return await _context.Enrollments
                .Include(e => e.Student)
                .Include(e => e.Course)
                .ToListAsync();
        }

        // GET: api/Enrollments/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Enrollment>> GetEnrollment(long id)
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Student)
                .Include(e => e.Course)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enrollment == null)
            {
                return NotFound();
            }

            return enrollment;
        }

        // GET: api/Enrollments/course/5
        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<Enrollment>>> GetEnrollmentsByCourse(long courseId)
        {
            return await _context.Enrollments
                .Include(e => e.Student)
                .Where(e => e.CourseId == courseId)
                .OrderBy(e => e.Student.PaternalSurname)
                .ThenBy(e => e.Student.FirstName)
                .ToListAsync();
        }

        // GET: api/Enrollments/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<Enrollment>>> GetEnrollmentsByStudent(long studentId)
        {
            return await _context.Enrollments
                .Include(e => e.Course)
                    .ThenInclude(c => c.Teacher)
                .Where(e => e.StudentId == studentId)
                .ToListAsync();
        }

        // POST: api/Enrollments
        [HttpPost]
        public async Task<ActionResult<Enrollment>> PostEnrollment(Enrollment enrollment)
        {
            // Check if already enrolled
            var exists = await _context.Enrollments.AnyAsync(e => 
                e.StudentId == enrollment.StudentId && e.CourseId == enrollment.CourseId);
            
            if (exists)
            {
                return Conflict("El alumno ya está inscrito en este curso.");
            }

            enrollment.EnrolledAt = DateTime.UtcNow;

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEnrollment), new { id = enrollment.Id }, enrollment);
        }

        // DELETE: api/Enrollments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEnrollment(long id)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
            {
                return NotFound();
            }

            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EnrollmentExists(long id)
        {
            return _context.Enrollments.Any(e => e.Id == id);
        }
    }
}
