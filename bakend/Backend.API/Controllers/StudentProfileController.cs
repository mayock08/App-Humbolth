using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentProfileController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public StudentProfileController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/StudentProfile/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetStudentProfile(long id)
        {
            var student = await _context.Students
                .Include(s => s.Family)
                .Include(s => s.Group)
                    .ThenInclude(g => g.Grade)
                        .ThenInclude(gr => gr.Level)
                .Include(s => s.StudentGuardians)
                    .ThenInclude(sg => sg.Guardian)
                .Include(s => s.Enrollments)
                    .ThenInclude(e => e.Course)
                        .ThenInclude(c => c.Teacher)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null)
            {
                return NotFound();
            }

            // Get grades/evaluations for this student
            var evaluations = await _context.StudentCourseEvaluations
                .Include(sce => sce.Evaluation)
                    .ThenInclude(e => e.Criteria)
                        .ThenInclude(c => c.Course)
                .Where(sce => sce.StudentId == id)
                .ToListAsync();

            // Build profile response
            var profile = new
            {
                student.Id,
                student.FirstName,
                student.PaternalSurname,
                student.MaternalSurname,
                FullName = $"{student.FirstName} {student.PaternalSurname} {student.MaternalSurname}",
                student.Gender,
                student.BirthDate,
                student.Curp,
                student.PhotoUrl,
                student.Email,
                student.Phone,
                student.StreetAddress,
                student.City,
                student.State,
                student.ZipCode,
                Grade = student.CurrentGrade,
                Group = student.CurrentGroup,
                Level = student.Group?.Grade?.Level?.Name,
                Family = student.Family != null ? new
                {
                    student.Family.Id,
                    student.Family.FamilyName,
                    student.Family.FamilyNumber
                } : null,
                Guardians = student.StudentGuardians.Select(sg => new
                {
                    sg.Guardian.Id,
                    sg.Guardian.FullName,
                    sg.Guardian.Phone,
                    sg.Guardian.Email,
                    sg.Relationship,
                    sg.Guardian.IsMother,
                    sg.Guardian.IsFather
                }).ToList(),
                Courses = student.Enrollments.Select(e => new
                {
                    e.Course.Id,
                    e.Course.Name,
                    e.Course.Grade,
                    Teacher = e.Course.Teacher?.FullName
                }).ToList(),
                Grades = evaluations.GroupBy(e => e.Evaluation.Criteria.Course.Name)
                    .Select(g => new
                    {
                        Subject = g.Key,
                        Evaluations = g.Select(e => new
                        {
                            e.Evaluation.Title,
                            e.Score,
                            ComponentType = e.Evaluation.Criteria.ComponentType,
                            Weight = e.Evaluation.Criteria.WeightPercentage
                        }).ToList(),
                        Average = g.Average(e => e.Score ?? 0)
                    }).ToList()
            };

            return Ok(profile);
        }

        // GET: api/StudentProfile/List?courseId=1
        [HttpGet("List")]
        public async Task<ActionResult<IEnumerable<object>>> GetStudentsByCourse([FromQuery] long? courseId, [FromQuery] string? grade, [FromQuery] string? group)
        {
            var query = _context.Students
                .Include(s => s.Group)
                    .ThenInclude(g => g.Grade)
                        .ThenInclude(gr => gr.Level)
                .AsQueryable();

            if (courseId.HasValue)
            {
                query = query.Where(s => s.Enrollments.Any(e => e.CourseId == courseId.Value));
            }

            if (!string.IsNullOrEmpty(grade))
            {
                query = query.Where(s => s.CurrentGrade == grade);
            }

            if (!string.IsNullOrEmpty(group))
            {
                query = query.Where(s => s.CurrentGroup == group);
            }

            var students = await query
                .Select(s => new
                {
                    s.Id,
                    s.FirstName,
                    s.PaternalSurname,
                    s.MaternalSurname,
                    FullName = $"{s.FirstName} {s.PaternalSurname} {s.MaternalSurname}",
                    s.PhotoUrl,
                    s.Email,
                    s.Phone,
                    Grade = s.CurrentGrade,
                    Group = s.CurrentGroup,
                    s.Status
                })
                .ToListAsync();

            return Ok(students);
        }
    }
}
