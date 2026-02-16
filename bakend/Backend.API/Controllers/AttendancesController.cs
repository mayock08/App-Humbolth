using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendancesController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public AttendancesController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/Attendances
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attendance>>> GetAttendances()
        {
            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.Course)
                .ToListAsync();
        }

        // GET: api/Attendances/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Attendance>> GetAttendance(long id)
        {
            var attendance = await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attendance == null)
            {
                return NotFound();
            }

            return attendance;
        }

        // GET: api/Attendances/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<Attendance>>> GetAttendancesByStudent(long studentId)
        {
            return await _context.Attendances
                .Include(a => a.Course)
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.ClassDate)
                .ToListAsync();
        }

        // POST: api/Attendances
        [HttpPost]
        public async Task<ActionResult<Attendance>> PostAttendance(Attendance attendance)
        {
            attendance.CreatedAt = DateTime.UtcNow;

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAttendance), new { id = attendance.Id }, attendance);
        }

        // POST: api/Attendances/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult<IEnumerable<Attendance>>> PostBulkAttendance(List<Attendance> attendances)
        {
            if (attendances == null || !attendances.Any())
            {
                return BadRequest("No attendance records provided.");
            }

            var courseId = attendances.First().CourseId;
            var date = attendances.First().ClassDate.Date;

            // Optional: Check if already exists for this date/course to prevent duplicates or allow update?
            // For now, let's assume we might want to update or insert.
            // Strategy: Remove existing for this date/course and insert new ones (simple replace)
            // Or better: Upsert.

            foreach (var att in attendances)
            {
                att.CreatedAt = DateTime.UtcNow;
                att.ClassDate = att.ClassDate.Date; // Ensure time is stripped

                var existing = await _context.Attendances
                    .FirstOrDefaultAsync(a => a.StudentId == att.StudentId && 
                                              a.CourseId == att.CourseId && 
                                              a.ClassDate == att.ClassDate);

                if (existing != null)
                {
                    existing.Status = att.Status;
                    existing.Note = att.Note;
                    existing.Emotion = att.Emotion;
                    _context.Entry(existing).State = EntityState.Modified;
                }
                else
                {
                    _context.Attendances.Add(att);
                }
            }
            
            await _context.SaveChangesAsync();

            return Ok(attendances);
        }

        // GET: api/Attendances/course/5/date/2023-10-27
        [HttpGet("course/{courseId}/date/{date}")]
        public async Task<ActionResult<IEnumerable<Attendance>>> GetAttendanceByDate(long courseId, DateTime date)
        {
            var attendanceList = await _context.Attendances
                .Where(a => a.CourseId == courseId && a.ClassDate == date.Date)
                .ToListAsync();

            return attendanceList;
        }

        // PUT: api/Attendances/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAttendance(long id, Attendance attendance)
        {
            if (id != attendance.Id)
            {
                return BadRequest();
            }

            _context.Entry(attendance).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AttendanceExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Attendances/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAttendance(long id)
        {
            var attendance = await _context.Attendances.FindAsync(id);
            if (attendance == null)
            {
                return NotFound();
            }

            _context.Attendances.Remove(attendance);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AttendanceExists(long id)
        {
            return _context.Attendances.Any(e => e.Id == id);
        }
    }
}
