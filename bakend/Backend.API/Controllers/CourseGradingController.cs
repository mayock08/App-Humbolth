using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseGradingController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public CourseGradingController(SupabaseDbContext context)
        {
            _context = context;
        }

        // --- Grading Criteria ---

        // GET: api/CourseGrading/criteria/course/5
        [HttpGet("criteria/course/{courseId}")]
        public async Task<ActionResult<IEnumerable<CourseGradingCriteria>>> GetCriteriaByCourse(long courseId)
        {
            return await _context.CourseGradingCriteria
                .Where(c => c.CourseId == courseId)
                .ToListAsync();
        }

        // POST: api/CourseGrading/criteria
        [HttpPost("criteria")]
        public async Task<ActionResult<CourseGradingCriteria>> PostCriteria(CourseGradingCriteria criteria)
        {
            criteria.CreatedAt = DateTime.UtcNow;
            criteria.UpdatedAt = DateTime.UtcNow;

            _context.CourseGradingCriteria.Add(criteria);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCriteriaByCourse), new { courseId = criteria.CourseId }, criteria);
        }

        // PUT: api/CourseGrading/criteria/5
        [HttpPut("criteria/{id}")]
        public async Task<IActionResult> PutCriteria(long id, CourseGradingCriteria criteria)
        {
            if (id != criteria.Id)
            {
                return BadRequest();
            }

            criteria.UpdatedAt = DateTime.UtcNow;
            _context.Entry(criteria).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.CourseGradingCriteria.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/CourseGrading/criteria/5
        [HttpDelete("criteria/{id}")]
        public async Task<IActionResult> DeleteCriteria(long id)
        {
            var criteria = await _context.CourseGradingCriteria.FindAsync(id);
            if (criteria == null)
            {
                return NotFound();
            }

            _context.CourseGradingCriteria.Remove(criteria);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --- Evaluations ---

        // GET: api/CourseGrading/evaluations/criteria/5
        [HttpGet("evaluations/criteria/{criteriaId}")]
        public async Task<ActionResult<IEnumerable<CourseEvaluation>>> GetEvaluationsByCriteria(long criteriaId)
        {
            return await _context.CourseEvaluations
                .Where(e => e.CriteriaId == criteriaId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        // GET: api/CourseGrading/evaluations/5
        [HttpGet("evaluations/{id}")]
        public async Task<ActionResult<CourseEvaluation>> GetEvaluation(long id)
        {
            var evaluation = await _context.CourseEvaluations
                .Include(e => e.Criteria)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evaluation == null)
            {
                return NotFound();
            }

            return evaluation;
        }

        // POST: api/CourseGrading/evaluations
        [HttpPost("evaluations")]
        public async Task<ActionResult<CourseEvaluation>> PostEvaluation(CourseEvaluation evaluation)
        {
            evaluation.CreatedAt = DateTime.UtcNow;

            _context.CourseEvaluations.Add(evaluation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvaluation), new { id = evaluation.Id }, evaluation);
        }

        // PUT: api/CourseGrading/evaluations/5
        [HttpPut("evaluations/{id}")]
        public async Task<IActionResult> PutEvaluation(long id, CourseEvaluation evaluation)
        {
            if (id != evaluation.Id)
            {
                return BadRequest();
            }

            _context.Entry(evaluation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.CourseEvaluations.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/CourseGrading/evaluations/5
        [HttpDelete("evaluations/{id}")]
        public async Task<IActionResult> DeleteEvaluation(long id)
        {
            var evaluation = await _context.CourseEvaluations.FindAsync(id);
            if (evaluation == null)
            {
                return NotFound();
            }

            _context.CourseEvaluations.Remove(evaluation);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
