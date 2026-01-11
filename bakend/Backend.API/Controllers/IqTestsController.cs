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
    }
}
