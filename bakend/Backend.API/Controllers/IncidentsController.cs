using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IncidentsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public IncidentsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/Incidents/types
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<IncidentType>>> GetIncidentTypes()
        {
            return await _context.IncidentTypes
                .Where(t => t.IsActive)
                .OrderBy(t => t.Severity)
                .ThenBy(t => t.Name)
                .ToListAsync();
        }

        // GET: api/Incidents/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentIncident>>> GetStudentIncidents(long studentId)
        {
            return await _context.StudentIncidents
                .Where(i => i.StudentId == studentId)
                .Include(i => i.Type)
                .Include(i => i.Reporter)
                .OrderByDescending(i => i.Date)
                .ToListAsync();
        }

        // GET: api/Incidents/teacher/5
        [HttpGet("teacher/{teacherId}")]
        public async Task<ActionResult<IEnumerable<StudentIncident>>> GetIncidentsByTeacher(long teacherId)
        {
            return await _context.StudentIncidents
                .Where(i => i.ReporterId == teacherId)
                .Include(i => i.Type)
                .Include(i => i.Student) // Include Student data
                .OrderByDescending(i => i.Date)
                .ToListAsync();
        }

        // POST: api/Incidents
        [HttpPost]
        public async Task<ActionResult<StudentIncident>> CreateIncident(StudentIncident incident)
        {
            if (incident.Date == default)
            {
                incident.Date = DateTime.UtcNow;
            }
            
            incident.CreatedAt = DateTime.UtcNow;
            incident.UpdatedAt = DateTime.UtcNow;

            _context.StudentIncidents.Add(incident);
            await _context.SaveChangesAsync();

            // Reload to get relationships
            await _context.Entry(incident).Reference(i => i.Type).LoadAsync();
            
            return CreatedAtAction(nameof(GetStudentIncidents), new { studentId = incident.StudentId }, incident);
        }

        // PUT: api/Incidents/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIncident(long id, StudentIncident incident)
        {
            if (id != incident.Id)
            {
                return BadRequest();
            }

            incident.UpdatedAt = DateTime.UtcNow;
            _context.Entry(incident).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IncidentExists(id))
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

        private bool IncidentExists(long id)
        {
            return _context.StudentIncidents.Any(e => e.Id == id);
        }
    }
}
