using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IqTestsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public IqTestsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/IqTests
        [HttpGet]
        public async Task<ActionResult<IEnumerable<IqTest>>> GetIqTests()
        {
            return await _context.IqTests
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Questions)
                        .ThenInclude(q => q.Options)
                .ToListAsync();
        }

        // GET: api/IqTests/5
        [HttpGet("{id}")]
        public async Task<ActionResult<IqTest>> GetIqTest(long id)
        {
            var iqTest = await _context.IqTests
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Questions)
                        .ThenInclude(q => q.Options)
                .Include(t => t.Attempts)
                    .ThenInclude(a => a.Student)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (iqTest == null)
            {
                return NotFound();
            }

            return iqTest;
        }

        // POST: api/IqTests
        [HttpPost]
        public async Task<ActionResult<IqTest>> PostIqTest(IqTest iqTest)
        {
            iqTest.CreatedAt = DateTime.UtcNow;

            _context.IqTests.Add(iqTest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetIqTest), new { id = iqTest.Id }, iqTest);
        }

        // PUT: api/IqTests/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutIqTest(long id, IqTest iqTest)
        {
            if (id != iqTest.Id)
            {
                return BadRequest();
            }

            _context.Entry(iqTest).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IqTestExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/IqTests/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIqTest(long id)
        {
            var iqTest = await _context.IqTests.FindAsync(id);
            if (iqTest == null)
            {
                return NotFound();
            }

            _context.IqTests.Remove(iqTest);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool IqTestExists(long id)
        {
            return _context.IqTests.Any(e => e.Id == id);
        }

        // POST: api/IqTests/assign
        [HttpPost("assign")]
        public async Task<IActionResult> AssignTestToGroup([FromBody] AssignTestDto dto)
        {
            var testGroup = await _context.IqTestGroups
                .FirstOrDefaultAsync(tg => tg.TestId == dto.TestId && tg.GroupId == dto.GroupId);

            if (testGroup == null)
            {
                testGroup = new IqTestGroup
                {
                    TestId = dto.TestId,
                    GroupId = dto.GroupId,
                    IsActive = dto.IsActive,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    CreatedAt = DateTime.UtcNow
                };
                _context.IqTestGroups.Add(testGroup);
            }
            else
            {
                testGroup.IsActive = dto.IsActive;
                testGroup.StartDate = dto.StartDate;
                testGroup.EndDate = dto.EndDate;
                _context.Entry(testGroup).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
            return Ok(testGroup);
        }

        // GET: api/IqTests/student/{studentId}/active
        [HttpGet("student/{studentId}/active")]
        public async Task<ActionResult<IqTest>> GetActiveTestForStudent(long studentId)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student == null || student.GroupId == null)
            {
                return NotFound("Student or Group not found");
            }

            // Check if student already completed the test? (Optional logic, enforcing allow multiple attempts for now or single)
            // For now, let's find an active test for the group
            var activeTestGroup = await _context.IqTestGroups
                .Include(tg => tg.Test)
                    .ThenInclude(t => t.Sections)
                        .ThenInclude(s => s.Questions)
                            .ThenInclude(q => q.Options)
                .Where(tg => tg.GroupId == student.GroupId && tg.IsActive && tg.Test.IsActive)
                .OrderByDescending(tg => tg.CreatedAt)
                .FirstOrDefaultAsync();

            if (activeTestGroup == null)
            {
                return NoContent();
            }

            // Check date range if applicable
            var now = DateTime.UtcNow;
            if (activeTestGroup.StartDate.HasValue && now < activeTestGroup.StartDate.Value) return NoContent();
            if (activeTestGroup.EndDate.HasValue && now > activeTestGroup.EndDate.Value) return NoContent();

            return activeTestGroup.Test;
        }

        // POST: api/IqTests/submit
        [HttpPost("submit")]
        public async Task<ActionResult<IqTestAttempt>> SubmitTestAttempt([FromBody] SubmitIqTestDto dto)
        {
            var student = await _context.Students.FindAsync(dto.StudentId);
            if (student == null) return NotFound("Student not found");

            var test = await _context.IqTests
                .Include(t => t.Sections)
                    .ThenInclude(s => s.Questions)
                        .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(t => t.Id == dto.TestId);

            if (test == null) return NotFound("Test not found");

            // Calculate Score
            int totalScore = 0;
            int maxScore = 0;
            
            // Map answers to dictionary for faster lookup
            var answerDict = dto.Answers.ToDictionary(a => a.QuestionId, a => a.SelectedOptionId);

            var newAttempt = new IqTestAttempt
            {
                StudentId = dto.StudentId,
                TestId = dto.TestId,
                StartedAt = dto.StartedAt,
                CompletedAt = DateTime.UtcNow
            };

            foreach (var section in test.Sections)
            {
                foreach (var question in section.Questions)
                {
                    maxScore += question.Score;
                    if (answerDict.TryGetValue(question.Id, out var selectedOptionId))
                    {
                        var selectedOption = question.Options.FirstOrDefault(o => o.Id == selectedOptionId);
                        bool isCorrect = selectedOption?.IsCorrect ?? false;
                        
                        if (isCorrect)
                        {
                            totalScore += question.Score;
                        }

                        newAttempt.Answers.Add(new IqAnswer
                        {
                            QuestionId = question.Id,
                            SelectedOptionId = selectedOptionId,
                            IsCorrect = isCorrect,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
            }

            newAttempt.RawScore = totalScore;
            newAttempt.MaxScore = maxScore;
            
            // Simple IQ Calculation Logic (Placeholder - can be replaced with standard deviation logic)
            // Assuming max score represents ~140 IQ and 0 represents ~60 IQ? 
            // Or just storing raw score for now.
            // Let's explicitly set IQ Score if provided (e.g. calculated on client) or just store Raw.
            // Requirement says "update the data in the table students attributes its IQ field"
            // Let's assume RawScore IS the IQ Score for this specific implementation request, or we map it.
            // Mapping Raw Score to IQ: (Raw / Max) * 100 + Baseline? 
            // Let's just store the Calculated IQ based on percentage for now * 160 (max realistic IQ)
            int calculatedIq = (int)((double)totalScore / maxScore * 160); 
            newAttempt.IqScore = calculatedIq;

            _context.IqTestAttempts.Add(newAttempt);
            
            // Update Student Profile
            student.IqScore = calculatedIq;
            _context.Entry(student).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return Ok(newAttempt);
        }
        }
    }

    public class AssignTestDto
    {
        public long TestId { get; set; }
        public int GroupId { get; set; }
        public bool IsActive { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class SubmitIqTestDto
    {
        public long StudentId { get; set; }
        public long TestId { get; set; }
        public DateTime StartedAt { get; set; }
        public List<SubmitAnswerDto> Answers { get; set; } = new List<SubmitAnswerDto>();
    }

    public class SubmitAnswerDto
    {
        public long QuestionId { get; set; }
        public long SelectedOptionId { get; set; }
    }
