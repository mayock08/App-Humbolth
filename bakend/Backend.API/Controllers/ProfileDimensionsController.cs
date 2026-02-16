using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileDimensionsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public ProfileDimensionsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/ProfileDimensions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProfileDimension>>> GetDimensions()
        {
            return await _context.ProfileDimensions.ToListAsync();
        }

        // GET: api/ProfileDimensions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProfileDimension>> GetDimension(long id)
        {
            var dimension = await _context.ProfileDimensions.FindAsync(id);

            if (dimension == null)
            {
                return NotFound();
            }

            return dimension;
        }

        // GET: api/ProfileDimensions/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentDimensionScore>>> GetStudentScores(long studentId)
        {
            return await _context.StudentDimensionScores
                .Include(s => s.Dimension)
                .Where(s => s.StudentId == studentId)
                .OrderBy(s => s.Dimension.Category)
                .ThenBy(s => s.Dimension.Name)
                .ToListAsync();
        }

        // POST: api/ProfileDimensions/score
        [HttpPost("score")]
        public async Task<ActionResult<StudentDimensionScore>> PostStudentScore(StudentDimensionScore score)
        {
            score.CreatedAt = DateTime.UtcNow;
            
            // Check if exists to update instead?
            var existing = await _context.StudentDimensionScores
                .FirstOrDefaultAsync(s => s.StudentId == score.StudentId && s.DimensionId == score.DimensionId && s.AssessedAt == score.AssessedAt);

            if (existing != null)
            {
                existing.Score = score.Score;
                existing.Source = score.Source;
                existing.Notes = score.Notes;
                _context.Entry(existing).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return Ok(existing);
            }

            _context.StudentDimensionScores.Add(score);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStudentScores), new { studentId = score.StudentId }, score);
        }
    }
}
