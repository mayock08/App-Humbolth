using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;
using Backend.API.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentReportsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;
        private readonly IPdfReportService _pdfService;
        private readonly IEmailService _emailService;

        public StudentReportsController(SupabaseDbContext context, IPdfReportService pdfService, IEmailService emailService)
        {
            _context = context;
            _pdfService = pdfService;
            _emailService = emailService;
        }

        // GET: api/StudentReports/group/5?periodId=1
        [HttpGet("group/{groupId}")]
        public async Task<ActionResult<IEnumerable<StudentGradeReportDto>>> GetGroupReports(long groupId, [FromQuery] int? periodId)
        {
            // Note: Currently GroupId in Student.cs is int?, but param is long. We cast to int.
            int gId = (int)groupId;

            var studentsQuery = _context.Students
                .Include(s => s.Family)
                .Include(s => s.StudentGuardians)
                    .ThenInclude(sg => sg.Guardian)
                .Where(s => s.GroupId == gId);

            var students = await studentsQuery.ToListAsync();

            var reports = new List<StudentGradeReportDto>();

            foreach (var student in students)
            {
                var evaluationsQuery = _context.StudentCourseEvaluations
                    .Include(e => e.Evaluation)
                        .ThenInclude(ev => ev.Criteria)
                            .ThenInclude(c => c.Course)
                                .ThenInclude(course => course.FormativeField)
                    .Where(e => e.StudentId == student.Id);

                if (periodId.HasValue && periodId.Value > 0)
                {
                    evaluationsQuery = evaluationsQuery.Where(e => e.Evaluation.Criteria.Course.PeriodId == periodId.Value);
                }

                var evaluations = await evaluationsQuery.ToListAsync();

                var courseGrades = evaluations.Select(e => new CourseGradeDto
                {
                    CourseName = e.Evaluation?.Criteria?.Course?.Name ?? "N/A",
                    FormativeFieldName = e.Evaluation?.Criteria?.Course?.FormativeField?.Name ?? "Independiente / Extracurricular",
                    Score = e.Score ?? 0m,
                    GradedAt = e.GradedAt
                }).ToList();

                decimal average = courseGrades.Count > 0 ? courseGrades.Average(c => c.Score) : 0m;

                string email = student.Email; // Default to student
                
                // Usually parent email is important, assuming Family has ContactEmail, else try guardians.
                if (string.IsNullOrEmpty(email)) 
                {
                     var guardian = student.StudentGuardians.FirstOrDefault(g => !string.IsNullOrEmpty(g.Guardian?.Email));
                     if (guardian != null) email = guardian.Guardian.Email;
                }

                bool hasEmail = !string.IsNullOrEmpty(email);

                reports.Add(new StudentGradeReportDto
                {
                    StudentId = student.Id,
                    StudentName = $"{student.FirstName} {student.PaternalSurname} {student.MaternalSurname}".Trim(),
                    Matricula = student.Matricula ?? "N/D",
                    GeneralAverage = average,
                    HasParentEmail = hasEmail,
                    ParentEmail = email ?? "",
                    Courses = courseGrades
                });
            }

            return Ok(reports);
        }

        [HttpGet("pdf/{studentId}")]
        public async Task<IActionResult> DownloadPdf(long studentId, [FromQuery] int? periodId)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student == null) return NotFound("Student not found.");

            var periodName = "";
            var evaluationsQuery = _context.StudentCourseEvaluations
                .Include(e => e.Evaluation)
                    .ThenInclude(ev => ev.Criteria)
                        .ThenInclude(c => c.Course)
                            .ThenInclude(c => c.Period)
                .Include(e => e.Evaluation)
                    .ThenInclude(ev => ev.Criteria)
                        .ThenInclude(c => c.Course)
                            .ThenInclude(c => c.FormativeField)
                .Where(e => e.StudentId == studentId);

            if (periodId.HasValue && periodId.Value > 0)
            {
                evaluationsQuery = evaluationsQuery.Where(e => e.Evaluation.Criteria.Course.PeriodId == periodId.Value);
                var periodInfo = await _context.SchoolPeriods.FindAsync(periodId.Value);
                if (periodInfo != null) periodName = periodInfo.Name;
            }

            var evaluations = await evaluationsQuery.ToListAsync();

            var courseGrades = evaluations.Select(e => new CourseGradeDto
            {
                CourseName = e.Evaluation?.Criteria?.Course?.Name ?? "N/A",
                FormativeFieldName = e.Evaluation?.Criteria?.Course?.FormativeField?.Name ?? "Independiente / Extracurricular",
                Score = e.Score ?? 0m,
                GradedAt = e.GradedAt,
            }).ToList();

            decimal average = courseGrades.Count > 0 ? courseGrades.Average(x => x.Score) : 0m;

            var reportDto = new StudentGradeReportDto
            {
                StudentId = studentId,
                StudentName = $"{student.FirstName} {student.PaternalSurname}".Trim(),
                Matricula = student.Matricula ?? "N/D",
                GeneralAverage = average,
                Courses = courseGrades
            };

            var pdfBytes = _pdfService.GenerateGradeReport(reportDto, periodName);

            return File(pdfBytes, "application/pdf", $"Ficha_{student.Matricula}.pdf");
        }

        [HttpPost("send-email")]
        public async Task<IActionResult> SendEmails([FromBody] BulkEmailRequestDto request)
        {
            if (request.StudentIds == null || request.StudentIds.Count == 0) return BadRequest("Students required.");

            // Fetch SMTP config
            var host = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "SMTP_HOST");
            var port = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "SMTP_PORT");
            var user = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "SMTP_USER");
            var pass = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == "SMTP_PASSWORD");

            if (host == null || port == null || user == null || pass == null)
            {
                return BadRequest("La configuración SMTP no está completa en el panel.");
            }

            if (!int.TryParse(port.SettingValue, out int portNumber)) portNumber = 587;

            int sentCount = 0;
            int errorCount = 0;

            foreach (var studentId in request.StudentIds)
            {
                try
                {
                    // For brevity, using internal logic to get student info again (mocking part of GetGroupReports)
                    var st = await _context.Students
                        .Include(s => s.Family)
                        .Include(s => s.StudentGuardians)
                            .ThenInclude(sg => sg.Guardian)
                        .FirstOrDefaultAsync(s => s.Id == studentId);

                    if (st == null) continue;

                    string email = st.Email; 
                    if (string.IsNullOrEmpty(email)) 
                    {
                         var guardian = st.StudentGuardians.FirstOrDefault(g => !string.IsNullOrEmpty(g.Guardian?.Email));
                         if (guardian != null) email = guardian.Guardian.Email;
                    }

                    if (string.IsNullOrEmpty(email))
                    {
                        errorCount++;
                        continue;
                    }

                    // Generate PDf
                    var pdfAct = await DownloadPdf(studentId, request.PeriodId) as FileContentResult;
                    if (pdfAct == null) continue;

                    var pdfBytes = pdfAct.FileContents;

                    // Send email
                    await _emailService.SendEmailWithAttachmentAsync(
                        email, 
                        "Reporte de Calificaciones - Ficha de Promedios", 
                        $"<p>Estimado padre de familia / tutor,</p><p>Adjuntamos el reporte de calificaciones de <b>{st.FirstName} {st.PaternalSurname}</b> correspondiente al periodo consultado.</p><p>Saludos,<br/>Colegio Humbolth</p>",
                        $"Calificaciones_{st.Matricula}.pdf",
                        pdfBytes,
                        host.SettingValue,
                        portNumber,
                        user.SettingValue,
                        pass.SettingValue
                    );

                    sentCount++;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error Email: {ex.Message}");
                    errorCount++;
                }
            }

            return Ok(new { message = "Bulk process completed", sentCount, errorCount });
        }
    }
}
