using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;
using System;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskSubmissionsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public TaskSubmissionsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/TaskSubmissions/task/5
        // For Teacher: Get all submissions for a specific task
        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetSubmissionsForTask(long taskId)
        {
            var submissions = await _context.TaskSubmissions
                .Include(s => s.Student)
                .Where(s => s.CourseTaskId == taskId)
                .Select(s => new {
                    s.Id,
                    s.CourseTaskId,
                    s.StudentId,
                    StudentName = s.Student!.FirstName + " " + s.Student.FirstName,
                    s.Status,
                    s.SubmissionDate,
                    s.TextResponse,
                    s.FileUrl,
                    s.ChecklistResponsesJson,
                    s.Grade,
                    s.TeacherFeedback
                })
                .ToListAsync();

            return Ok(submissions);
        }

        // GET: api/TaskSubmissions/task/5/student/10
        // For Student: Get their specific submission for a task
        [HttpGet("task/{taskId}/student/{studentId}")]
        public async Task<ActionResult<TaskSubmission>> GetStudentSubmission(long taskId, long studentId)
        {
            var submission = await _context.TaskSubmissions
                .FirstOrDefaultAsync(s => s.CourseTaskId == taskId && s.StudentId == studentId);

            if (submission == null)
            {
                return NotFound();
            }

            return submission;
        }

        // POST: api/TaskSubmissions
        // For Teacher/System: Assign a task to a student (creates empty submission)
        [HttpPost]
        public async Task<ActionResult<TaskSubmission>> PostTaskSubmission(TaskSubmission taskSubmission)
        {
            taskSubmission.Status = "ASSIGNED";
            _context.TaskSubmissions.Add(taskSubmission);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetStudentSubmission", new { taskId = taskSubmission.CourseTaskId, studentId = taskSubmission.StudentId }, taskSubmission);
        }

        // PUT: api/TaskSubmissions/5/submit
        // For Student: Submit their work
        [HttpPut("{id}/submit")]
        public async Task<IActionResult> SubmitTask(long id, TaskSubmission submissionUpdate)
        {
            var submission = await _context.TaskSubmissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound();
            }

            submission.Status = "SUBMITTED";
            submission.SubmissionDate = DateTime.UtcNow;
            submission.TextResponse = submissionUpdate.TextResponse;
            submission.FileUrl = submissionUpdate.FileUrl;
            submission.ChecklistResponsesJson = submissionUpdate.ChecklistResponsesJson;
            submission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/TaskSubmissions/5/grade
        // For Teacher: Grade the submission
        [HttpPut("{id}/grade")]
        public async Task<IActionResult> GradeSubmission(long id, TaskSubmission gradeUpdate)
        {
            var submission = await _context.TaskSubmissions.FindAsync(id);
            if (submission == null)
            {
                return NotFound();
            }

            submission.Status = "GRADED";
            submission.Grade = gradeUpdate.Grade;
            submission.TeacherFeedback = gradeUpdate.TeacherFeedback;
            submission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
