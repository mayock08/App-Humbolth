using Backend.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminDashboardController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public AdminDashboardController(SupabaseDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            // 1. Total Students
            var totalStudents = await _context.Students.CountAsync();

            // 2. Pending Documents (Mock logic: Students with missing basic info? Or just 0 for now)
            // Let's say "Pending" is inactive students or missing CURP?
            var pendingDocs = await _context.Students.CountAsync(s => string.IsNullOrEmpty(s.Curp));

            // 3. New Enrollments (Last 30 days)
            var lat30Days = DateTime.UtcNow.AddDays(-30);
            var newEnrollments = await _context.Students.CountAsync(s => s.CreatedAt >= lat30Days);

            // 4. Enrollment by Level
            // Group students by their Group -> Grade -> Level
            var studentsWithGroup = await _context.Students
                .Include(s => s.Group)
                .ThenInclude(g => g.Grade)
                .ThenInclude(gr => gr.Level)
                .Where(s => s.GroupId != null)
                .ToListAsync();

            var byLevel = studentsWithGroup
                .GroupBy(s => s.Group?.Grade?.Level?.Name ?? "Sin Asignar")
                .Select(g => new { Level = g.Key, Count = g.Count() })
                .ToDictionary(k => k.Level, v => v.Count);

            // 5. Recent "Actions" (Recent Students)
            var recentStudents = await _context.Students
                .OrderByDescending(s => s.CreatedAt)
                .Take(5)
                .Select(s => new 
                {
                    Id = s.Id,
                    Name = $"{s.FirstName} {s.PaternalSurname}",
                    Joined = s.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                totalStudents,
                pendingDocs,
                newEnrollments,
                byLevel,
                recentStudents
            });
        }
    }
}
