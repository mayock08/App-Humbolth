using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GuardiansController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public GuardiansController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/Guardians
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Guardian>>> GetGuardians()
        {
            return await _context.Guardians
                .Include(g => g.StudentGuardians)
                    .ThenInclude(sg => sg.Student)
                .ToListAsync();
        }

        // GET: api/Guardians/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Guardian>> GetGuardian(long id)
        {
            var guardian = await _context.Guardians
                .Include(g => g.StudentGuardians)
                    .ThenInclude(sg => sg.Student)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (guardian == null)
            {
                return NotFound();
            }

            return guardian;
        }

        // POST: api/Guardians
        [HttpPost]
        public async Task<ActionResult<Guardian>> PostGuardian(Guardian guardian)
        {
            guardian.CreatedAt = DateTime.UtcNow;

            _context.Guardians.Add(guardian);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGuardian), new { id = guardian.Id }, guardian);
        }

        // PUT: api/Guardians/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGuardian(long id, Guardian guardian)
        {
            if (id != guardian.Id)
            {
                return BadRequest();
            }

            _context.Entry(guardian).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GuardianExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Guardians/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGuardian(long id)
        {
            var guardian = await _context.Guardians.FindAsync(id);
            if (guardian == null)
            {
                return NotFound();
            }

            _context.Guardians.Remove(guardian);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GuardianExists(long id)
        {
            return _context.Guardians.Any(e => e.Id == id);
        }
    }
}
