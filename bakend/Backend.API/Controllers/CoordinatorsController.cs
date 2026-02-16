using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoordinatorsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public CoordinatorsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // --- CRUD for Admin ---

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Coordinator>>> GetCoordinators()
        {
            return await _context.Coordinators
                .Include(c => c.Assignments)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Coordinator>> GetCoordinator(long id)
        {
            var coordinator = await _context.Coordinators
                .Include(c => c.Assignments)
                .ThenInclude(a => a.Group) // Assuming SchoolGroup navigation exists or just ID
                .FirstOrDefaultAsync(c => c.Id == id);

            if (coordinator == null) return NotFound();
            return coordinator;
        }

        [HttpPost]
        public async Task<ActionResult<Coordinator>> PostCoordinator(Coordinator coordinator)
        {
            _context.Coordinators.Add(coordinator);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCoordinator), new { id = coordinator.Id }, coordinator);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutCoordinator(long id, Coordinator coordinator)
        {
            if (id != coordinator.Id) return BadRequest();
            _context.Entry(coordinator).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        // --- Assignments ---

        [HttpPost("{id}/assignments")]
        public async Task<IActionResult> AssignGroups(long id, [FromBody] List<int> groupIds)
        {
            var coordinator = await _context.Coordinators.FindAsync(id);
            if (coordinator == null) return NotFound();

            // Clear existing
            var existing = _context.CoordinatorGroups.Where(cg => cg.CoordinatorId == id);
            _context.CoordinatorGroups.RemoveRange(existing);

            // Add new
            foreach (var gid in groupIds)
            {
                _context.CoordinatorGroups.Add(new CoordinatorGroup
                {
                    CoordinatorId = id,
                    GroupId = gid
                });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("groups")]
        public async Task<ActionResult<IEnumerable<dynamic>>> GetGroups()
        {
            var groups = await _context.SchoolGroups
                .Include(g => g.Grade)
                .ThenInclude(gr => gr.Level)
                .Select(g => new 
                {
                    Id = g.Id,
                    Name = g.Name,
                    GradeName = g.Grade.Name,
                    LevelName = g.Grade.Level.Name,
                    DisplayName = $"{g.Grade.Level.Name} {g.Grade.Name} - {g.Name}"
                })
                .ToListAsync();

            return Ok(groups);
        }

        // --- Dashboard Stats ---

        [HttpGet("dashboard/{id}")]
        public async Task<ActionResult<CoordinatorDashboardStats>> GetDashboardStats(long id)
        {
            // 1. Get Assigned Group IDs
            var groupIds = await _context.CoordinatorGroups
                .Where(cg => cg.CoordinatorId == id)
                .Select(cg => cg.GroupId)
                .ToListAsync();

            if (!groupIds.Any()) return new CoordinatorDashboardStats();

            // 2. Get Students in these groups
            var students = await _context.Students
                .Include(s => s.Group)
                .Where(s => s.GroupId.HasValue && groupIds.Contains(s.GroupId.Value))
                .ToListAsync();
            
            var studentIds = students.Select(s => s.Id).ToList();

            if (!studentIds.Any()) return new CoordinatorDashboardStats
            {
                TotalStudents = 0,
                AssignedGroupsCount = groupIds.Count
            };

            // 3. Stats
            var today = DateTime.UtcNow.Date; // Be careful with timezone in real app, sticking to UTC for now
            
            // Absences
            var absences = await _context.Attendances
                .Where(a => studentIds.Contains(a.StudentId) && a.ClassDate.Date == today && a.Status == "A")
                .CountAsync();

            // Incidents (Today)
            var incidentsToday = await _context.StudentIncidents
                .Where(i => studentIds.Contains(i.StudentId) && i.Date.Date == today)
                .CountAsync();

            // Emotions (Today) - Fetch list then group in memory to avoid translation issues
            var emotionData = await _context.Attendances
                .Where(a => studentIds.Contains(a.StudentId) && a.ClassDate.Date == today && a.Emotion != null)
                .Select(a => a.Emotion)
                .ToListAsync();

            var emotions = emotionData
                .GroupBy(e => e)
                .ToDictionary(g => g.Key!, g => g.Count());

            // 4. At Risk Students
            // Logic: > 3 absences in last 30 days OR > 0 incidents in last 30 days
            var thirtyDaysAgo = today.AddDays(-30);

            var riskyAttendanceIds = await _context.Attendances
                 .Where(a => studentIds.Contains(a.StudentId) && a.Status == "A" && a.ClassDate > thirtyDaysAgo)
                 .GroupBy(a => a.StudentId)
                 .Where(g => g.Count() >= 3)
                 .Select(g => g.Key)
                 .ToListAsync();

            var riskyIncidentIds = await _context.StudentIncidents
                .Where(i => studentIds.Contains(i.StudentId) && i.Date > thirtyDaysAgo)
                .Select(i => i.StudentId)
                .Distinct()
                .ToListAsync();
            
            var allRiskyIds = riskyAttendanceIds.Union(riskyIncidentIds).Distinct().ToList();

            var atRiskStudents = students
                .Where(s => allRiskyIds.Contains(s.Id))
                .Select(s => new StudentSummaryDto 
                { 
                    Id = s.Id, 
                    Name = $"{s.FirstName} {s.PaternalSurname}",
                    Group = s.Group?.Name ?? "N/A"
                })
                .Take(10) // Limit
                .ToList();

            return new CoordinatorDashboardStats
            {
                TotalStudents = students.Count,
                AssignedGroupsCount = groupIds.Count,
                AbsencesToday = absences,
                IncidentsToday = incidentsToday,
                EmotionSummary = emotions,
                AtRiskStudents = atRiskStudents
            };
        }
    }

    public class CoordinatorDashboardStats
    {
        public int TotalStudents { get; set; }
        public int AssignedGroupsCount { get; set; }
        public int AbsencesToday { get; set; }
        public int IncidentsToday { get; set; }
        public Dictionary<string, int> EmotionSummary { get; set; } = new();
        public List<StudentSummaryDto> AtRiskStudents { get; set; } = new();
    }

    public class StudentSummaryDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
    }
}
