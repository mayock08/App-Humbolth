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

        // GET: api/StudentProfile/{studentId}/activities
        [HttpGet("{studentId}/activities")]
        public async Task<ActionResult<IEnumerable<object>>> GetStudentActivities(long studentId)
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.StudentId == studentId)
                .ToListAsync();

            var courseIds = enrollments.Select(e => e.CourseId).ToList();

            // Fetch CourseTasks (Tareas, Proyectos)
            var courseTasks = await _context.CourseTasks
                .Include(ct => ct.Course)
                .Include(ct => ct.Submissions.Where(s => s.StudentId == studentId))
                .Where(ct => courseIds.Contains(ct.CourseId))
                .ToListAsync();

            // Fetch Activities (Exámenes Interactivos)
            var activities = await _context.Activities
                .Include(a => a.Course)
                .Include(a => a.StudentActivities.Where(sa => sa.StudentId == studentId))
                .Where(a => a.CourseId.HasValue && courseIds.Contains(a.CourseId.Value))
                .ToListAsync();

            var unifiedList = new List<object>();

            foreach (var ct in courseTasks)
            {
                var submission = ct.Submissions.FirstOrDefault();
                unifiedList.Add(new
                {
                    id = $"task-{ct.Id}",
                    courseId = ct.CourseId,
                    courseName = ct.Course?.Name,
                    title = ct.Title,
                    description = ct.Description,
                    dueDate = ct.DueDate ?? ct.CreatedAt.AddDays(7),
                    type = ct.SubmissionType == "FileUpload" ? "Tarea" : 
                           (ct.SubmissionType == "Project" ? "Proyecto" : "Tarea"),
                    status = submission != null ? 
                             (submission.Status == "GRADED" ? "Calificado" : 
                              (submission.Status == "SUBMITTED" ? "En progreso" : "Pendiente")) 
                             : "Pendiente",
                    grade = submission?.Grade
                });
            }

            foreach (var a in activities)
            {
                var studentActivity = a.StudentActivities.FirstOrDefault();
                unifiedList.Add(new
                {
                    id = $"exam-{a.Id}",
                    courseId = a.CourseId,
                    courseName = a.Course?.Name,
                    title = a.Title,
                    description = a.Description,
                    dueDate = a.DueDate ?? a.CreatedAt.AddDays(7),
                    type = a.ActivityType ?? "Examen",
                    status = studentActivity != null ? 
                             (studentActivity.Status == "GRADED" ? "Calificado" : 
                              (studentActivity.Status == "SUBMITTED" ? "En progreso" : "Pendiente")) 
                             : "Pendiente",
                    grade = studentActivity?.FinalGrade
                });
            }

            return Ok(unifiedList.OrderBy(u => ((dynamic)u).dueDate));
        }
    }
}
