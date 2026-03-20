using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceRegistriesController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public AttendanceRegistriesController(SupabaseDbContext context)
        {
            _context = context;
        }

        // POST: api/AttendanceRegistries
        [HttpPost]
        public async Task<ActionResult<AttendanceRegistry>> PostAttendanceRegistry(AttendanceRegistry registry)
        {
            if (registry == null)
            {
                return BadRequest("Invalid data");
            }

            registry.RegistryDate = registry.RegistryDate.Date;
            registry.UpdatedAt = DateTime.UtcNow;

            var existing = await _context.AttendanceRegistries
                .FirstOrDefaultAsync(ar => ar.CourseId == registry.CourseId && ar.RegistryDate == registry.RegistryDate);

            if (existing != null)
            {
                // Update
                existing.Observation = registry.Observation;
                existing.TeacherId = registry.TeacherId;
                existing.UpdatedAt = registry.UpdatedAt;
                existing.SchoolPeriodId = registry.SchoolPeriodId;

                _context.Entry(existing).State = EntityState.Modified;
            }
            else
            {
                // Create
                _context.AttendanceRegistries.Add(registry);
            }

            await _context.SaveChangesAsync();

            return Ok(existing ?? registry);
        }

        // GET: api/AttendanceRegistries/course/{courseId}/date/{date}
        [HttpGet("course/{courseId}/date/{date}")]
        public async Task<ActionResult<AttendanceRegistry>> GetByCourseAndDate(long courseId, DateTime date)
        {
            var registry = await _context.AttendanceRegistries
                .FirstOrDefaultAsync(ar => ar.CourseId == courseId && ar.RegistryDate == date.Date);

            if (registry == null)
            {
                return NotFound();
            }

            return registry;
        }
    }
}
