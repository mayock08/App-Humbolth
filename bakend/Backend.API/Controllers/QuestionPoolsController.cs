using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;
using System.Text.Json;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionPoolsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;
        private readonly IConfiguration _configuration;

        public QuestionPoolsController(SupabaseDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/QuestionPools/teacher/5
        [HttpGet("teacher/{teacherId}")]
        public async Task<ActionResult<IEnumerable<QuestionPool>>> GetPoolsByTeacher(long teacherId)
        {
            return await _context.QuestionPools
                .Where(p => p.TeacherId == teacherId)
                .OrderByDescending(p => p.CreatedAt)
                .Include(p => p.Questions)
                .ToListAsync();
        }

        // GET: api/QuestionPools/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QuestionPool>> GetPool(long id)
        {
            var pool = await _context.QuestionPools
                .Include(p => p.Questions)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pool == null)
            {
                return NotFound();
            }

            return pool;
        }

        // POST: api/QuestionPools
        [HttpPost]
        public async Task<ActionResult<QuestionPool>> CreatePool(QuestionPool pool)
        {
            pool.CreatedAt = DateTime.UtcNow;
            _context.QuestionPools.Add(pool);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPool), new { id = pool.Id }, pool);
        }

        // POST: api/QuestionPools/5/questions
        [HttpPost("{poolId}/questions")]
        public async Task<ActionResult<PoolQuestion>> AddQuestion(long poolId, PoolQuestion question)
        {
            if (poolId != question.PoolId)
            {
                return BadRequest("Pool ID mismatch");
            }

            var pool = await _context.QuestionPools.FindAsync(poolId);
            if (pool == null)
            {
                return NotFound("Pool not found");
            }

            question.CreatedAt = DateTime.UtcNow;
            _context.PoolQuestions.Add(question);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPool", new { id = poolId }, question);
        }

        // POST: api/QuestionPools/5/create-exam
        [HttpPost("{poolId}/create-exam")]
        public async Task<ActionResult<Activity>> CreateExamFromPool(long poolId, [FromBody] CreateExamRequest request)
        {
            var pool = await _context.QuestionPools
                .Include(p => p.Questions)
                .FirstOrDefaultAsync(p => p.Id == poolId);

            if (pool == null)
            {
                return NotFound("Pool not found");
            }

            if (!pool.Questions.Any())
            {
                return BadRequest("Pool has no questions");
            }

            // Create the Activity (Exam)
            var activity = new Activity
            {
                Title = request.Title,
                Description = request.Description ?? pool.Description, // Default to pool desc if null
                ActivityType = "Examen", // Enforcing type
                TeacherId = pool.TeacherId,
                IsPublished = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync(); // Save to get Activity ID

            // Copy Questions
            var activityQuestions = pool.Questions.Select(pq => new ActivityQuestion
            {
                ActivityId = activity.Id,
                QuestionText = pq.QuestionText,
                QuestionTypeCode = pq.QuestionType == "multiple_choice" ? "MULTIPLE_CHOICE" : "OPEN", // Simplified mapping
                OptionsJson = pq.OptionsJson,
                CorrectAnswerJson = pq.CorrectAnswerJson,
                Points = pq.Points,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.ActivityQuestions.AddRange(activityQuestions);
            await _context.SaveChangesAsync();

            return Ok(activity);
        }

        // POST: api/QuestionPools/5/generate-ai
        [HttpPost("{poolId}/generate-ai")]
        public async Task<ActionResult<IEnumerable<PoolQuestion>>> GenerateQuestions(long poolId, [FromBody] GenerateAiRequest request)
        {
            var pool = await _context.QuestionPools.FindAsync(poolId);
            if (pool == null)
            {
                return NotFound("Pool not found");
            }

            var webhookUrl = _configuration["N8N:WebhookUrl"];
            if (string.IsNullOrEmpty(webhookUrl))
            {
                return StatusCode(500, "N8N Webhook URL is not configured");
            }

            try
            {
                using var httpClient = new HttpClient();
                var payload = new
                {
                    topic = request.Topic,
                    count = request.Count,
                    poolId = poolId,
                    poolName = pool.Name,
                    poolDescription = pool.Description
                };

                var response = await httpClient.PostAsJsonAsync(webhookUrl, payload);
                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, "Error calling N8N Webhook");
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                
                // Expected format from N8N: Array of objects with questionText, options (array of strings), correctAnswer (string or index)
                // We need to map this to PoolQuestion. 
                // This part depends heavily on the N8N output structure. 
                // Assumption: N8N returns adequate JSON structure.
                
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var generatedQuestions = JsonSerializer.Deserialize<List<GeneratedQuestionDto>>(jsonResponse, options);

                if (generatedQuestions == null || !generatedQuestions.Any())
                {
                    return Ok(new List<PoolQuestion>()); // Or BadRequest("No questions generated")
                }

                var newQuestions = new List<PoolQuestion>();

                foreach (var gq in generatedQuestions)
                {
                    // Map options to internal structure
                    var poolOptions = new List<object>();
                    int idCounter = 1;
                    int correctId = 1; // Default
                    
                    foreach (var optText in gq.Options)
                    {
                        var isCorrect = optText == gq.CorrectAnswer; 
                        // fallback logic if correctAnswer is an index (0-based)
                        if (int.TryParse(gq.CorrectAnswer, out int correctIndex)) {
                             isCorrect = (idCounter - 1) == correctIndex;
                        }

                        if (isCorrect) correctId = idCounter;

                        poolOptions.Add(new { id = idCounter++, text = optText, isCorrect = isCorrect });
                    }

                    var question = new PoolQuestion
                    {
                        PoolId = poolId,
                        QuestionText = gq.QuestionText,
                        QuestionType = "multiple_choice",
                        Points = 1, // Default
                        OptionsJson = JsonSerializer.Serialize(poolOptions),
                        CorrectAnswerJson = JsonSerializer.Serialize(new[] { correctId }),
                        CreatedAt = DateTime.UtcNow
                    };
                    newQuestions.Add(question);
                }

                _context.PoolQuestions.AddRange(newQuestions);
                await _context.SaveChangesAsync();

                return Ok(newQuestions);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class GenerateAiRequest
    {
        public string Topic { get; set; } = string.Empty;
        public int Count { get; set; } = 5;
    }

    public class GeneratedQuestionDto
    {
        public string QuestionText { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
        public string CorrectAnswer { get; set; } = string.Empty;
    }

    public class CreateExamRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
    }
}
