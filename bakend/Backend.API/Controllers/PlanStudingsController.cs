using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlanStudingsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public PlanStudingsController(SupabaseDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlanStudingDto>>> GetPlanStudings()
        {
            var plans = await _context.PlanStudings
                .Include(p => p.Period)
                .Include(p => p.PlanCourses)
                    .ThenInclude(pc => pc.Course)
                .Select(p => new PlanStudingDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    PeriodId = p.PeriodId,
                    PeriodName = p.Period != null ? p.Period.Name : null,
                    AttachmentUrl = p.AttachmentUrl,
                    CreatedAt = p.CreatedAt,
                    Courses = p.PlanCourses.Select(pc => new PlanStudingCourseDto
                    {
                        Id = pc.Id,
                        CourseId = pc.CourseId,
                        CourseName = pc.Course != null ? pc.Course.Name : null,
                        Grade = pc.Course != null ? pc.Course.Grade : null,
                        IsOfficialSep = pc.IsOfficialSep
                    }).ToList()
                })
                .ToListAsync();

            return Ok(plans);
        }

        [HttpPost]
        public async Task<ActionResult<PlanStudingDto>> CreatePlanStuding([FromBody] CreatePlanStudingDto dto)
        {
            var plan = new PlanStuding
            {
                Name = dto.Name,
                PeriodId = dto.PeriodId,
                AttachmentUrl = dto.AttachmentUrl,
                CreatedAt = System.DateTime.UtcNow
            };

            _context.PlanStudings.Add(plan);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlanStudings), new { id = plan.Id }, plan);
        }

        [HttpPost("{planId}/courses")]
        public async Task<IActionResult> AddCourseToPlan(int planId, [FromBody] AddCourseToPlanDto dto)
        {
            var plan = await _context.PlanStudings.FindAsync(planId);
            if (plan == null) return NotFound("Plan no encontrado.");

            var exists = await _context.PlanStudingCourses.AnyAsync(pc => pc.PlanStudingId == planId && pc.CourseId == dto.CourseId);
            if (exists) return BadRequest("La materia ya está asignada a este plan.");

            var planCourse = new PlanStudingCourse
            {
                PlanStudingId = planId,
                CourseId = dto.CourseId,
                IsOfficialSep = dto.IsOfficialSep,
                CreatedAt = System.DateTime.UtcNow
            };

            _context.PlanStudingCourses.Add(planCourse);
            await _context.SaveChangesAsync();

            return Ok(planCourse);
        }

        [HttpPut("courses/{planCourseId}")]
        public async Task<IActionResult> UpdatePlanCourse(int planCourseId, [FromBody] AddCourseToPlanDto dto)
        {
            var planCourse = await _context.PlanStudingCourses.FindAsync(planCourseId);
            if (planCourse == null) return NotFound();

            planCourse.IsOfficialSep = dto.IsOfficialSep;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("courses/{planCourseId}")]
        public async Task<IActionResult> RemoveCourseFromPlan(int planCourseId)
        {
            var planCourse = await _context.PlanStudingCourses.FindAsync(planCourseId);
            if (planCourse == null) return NotFound();

            _context.PlanStudingCourses.Remove(planCourse);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
        [HttpDelete("{planId}")]
        public async Task<IActionResult> DeletePlanStuding(int planId)
        {
            var plan = await _context.PlanStudings.FindAsync(planId);
            if (plan == null) return NotFound();
            
            _context.PlanStudings.Remove(plan);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
