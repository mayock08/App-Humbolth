using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormativeFieldsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public FormativeFieldsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/FormativeFields
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormativeField>>> GetFormativeFields()
        {
            return await _context.FormativeFields.ToListAsync();
        }

        // GET: api/FormativeFields/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FormativeField>> GetFormativeField(int id)
        {
            var formativeField = await _context.FormativeFields.FindAsync(id);

            if (formativeField == null)
            {
                return NotFound();
            }

            return formativeField;
        }

        // POST: api/FormativeFields
        [HttpPost]
        public async Task<ActionResult<FormativeField>> PostFormativeField(FormativeField formativeField)
        {
            formativeField.CreatedAt = DateTime.UtcNow;
            _context.FormativeFields.Add(formativeField);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFormativeField", new { id = formativeField.Id }, formativeField);
        }

        // PUT: api/FormativeFields/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormativeField(int id, FormativeField formativeField)
        {
            if (id != formativeField.Id)
            {
                return BadRequest();
            }

            _context.Entry(formativeField).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FormativeFieldExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/FormativeFields/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormativeField(int id)
        {
            var formativeField = await _context.FormativeFields.FindAsync(id);
            if (formativeField == null)
            {
                return NotFound();
            }

            _context.FormativeFields.Remove(formativeField);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FormativeFieldExists(int id)
        {
            return _context.FormativeFields.Any(e => e.Id == id);
        }
    }
}
