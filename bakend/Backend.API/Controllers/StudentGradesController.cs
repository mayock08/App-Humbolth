using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentGradesController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public StudentGradesController(SupabaseDbContext context)
        {
            _context = context;
        }

        // POST: api/StudentGrades
        [HttpPost]
        public async Task<ActionResult<StudentCourseEvaluation>> PostStudentGrade(StudentCourseEvaluation studentGrade)
        {
            studentGrade.CreatedAt = DateTime.UtcNow;
            studentGrade.UpdatedAt = DateTime.UtcNow;
            studentGrade.GradedAt = DateTime.UtcNow;

            _context.StudentCourseEvaluations.Add(studentGrade);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGrade), new { id = studentGrade.Id }, studentGrade);
        }

        // PUT: api/StudentGrades/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStudentGrade(long id, StudentCourseEvaluation studentGrade)
        {
            if (id != studentGrade.Id)
            {
                return BadRequest();
            }

            studentGrade.UpdatedAt = DateTime.UtcNow;
            studentGrade.GradedAt = DateTime.UtcNow;

            _context.Entry(studentGrade).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StudentGradeExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // GET: api/StudentGrades/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StudentCourseEvaluation>> GetGrade(long id)
        {
            var grade = await _context.StudentCourseEvaluations
                .Include(g => g.Student)
                .Include(g => g.Evaluation)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grade == null)
            {
                return NotFound();
            }

            return grade;
        }

        // GET: api/StudentGrades/evaluation/5
        [HttpGet("evaluation/{evaluationId}")]
        public async Task<ActionResult<IEnumerable<StudentCourseEvaluation>>> GetGradesByEvaluation(long evaluationId)
        {
            return await _context.StudentCourseEvaluations
                .Include(g => g.Student)
                .Where(g => g.EvaluationId == evaluationId)
                .OrderBy(g => g.Student.PaternalSurname)
                .ToListAsync();
        }

        // GET: api/StudentGrades/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentCourseEvaluation>>> GetGradesByStudent(long studentId)
        {
            return await _context.StudentCourseEvaluations
                .Include(g => g.Evaluation)
                    .ThenInclude(e => e.Criteria)
                        .ThenInclude(c => c.Course)
                .Where(g => g.StudentId == studentId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }


        // POST: api/StudentGrades/bulk
        [HttpPost("bulk")]
        public async Task<IActionResult> PostBulkGrades(List<BulkGradeDto> bulkGrades)
        {
            if (bulkGrades == null || !bulkGrades.Any())
            {
                return BadRequest("No grades provided.");
            }

            // Optional: Optimize by fetching potentially affected existing grades in one query 
            // instead of N queries if performance becomes an issue.
            // For now, simple loop is fine for class sizes (< 50).
            
            foreach (var gradeDto in bulkGrades)
            {
                // Check if a grade already exists for this student and evaluation
                var existingGrade = await _context.StudentCourseEvaluations
                    .FirstOrDefaultAsync(g => g.StudentId == gradeDto.StudentId && g.EvaluationId == gradeDto.EvaluationId);

                if (existingGrade != null)
                {
                    // Update
                    existingGrade.Score = gradeDto.Score;
                    existingGrade.Feedback = gradeDto.Feedback;
                    existingGrade.UpdatedAt = DateTime.UtcNow;
                    existingGrade.GradedAt = DateTime.UtcNow;
                    _context.Entry(existingGrade).State = EntityState.Modified;
                }
                else
                {
                    // Create
                    var newGrade = new StudentCourseEvaluation
                    {
                        StudentId = gradeDto.StudentId,
                        EvaluationId = gradeDto.EvaluationId,
                        Score = gradeDto.Score,
                        Feedback = gradeDto.Feedback,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        GradedAt = DateTime.UtcNow
                    };
                    _context.StudentCourseEvaluations.Add(newGrade);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Grades updated successfully", count = bulkGrades.Count });
        }

        private bool StudentGradeExists(long id)
        {
            return _context.StudentCourseEvaluations.Any(e => e.Id == id);
        }
    }
}

