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
