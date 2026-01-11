using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FamiliesController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public FamiliesController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/Families
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Family>>> GetFamilies()
        {
            return await _context.Families
                .Include(f => f.Students)
                .ToListAsync();
        }

        // GET: api/Families/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Family>> GetFamily(long id)
        {
            var family = await _context.Families
                .Include(f => f.Students)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (family == null)
            {
                return NotFound();
            }

            return family;
        }

        // POST: api/Families
        [HttpPost]
        public async Task<ActionResult<Family>> PostFamily(Family family)
        {
            family.CreatedAt = DateTime.UtcNow;
            family.UpdatedAt = DateTime.UtcNow;

            _context.Families.Add(family);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFamily), new { id = family.Id }, family);
        }

        // PUT: api/Families/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFamily(long id, Family family)
        {
            if (id != family.Id)
            {
                return BadRequest();
            }

            family.UpdatedAt = DateTime.UtcNow;
            _context.Entry(family).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FamilyExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Families/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFamily(long id)
        {
            var family = await _context.Families.FindAsync(id);
            if (family == null)
            {
                return NotFound();
            }

            _context.Families.Remove(family);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FamilyExists(long id)
        {
            return _context.Families.Any(e => e.Id == id);
        }
    }
}
