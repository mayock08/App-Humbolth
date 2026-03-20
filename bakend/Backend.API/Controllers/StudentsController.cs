using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public StudentsController(SupabaseDbContext context)
        {
            _context = context;
        }

        // GET: api/Students
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Student>>> GetStudents(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? cycle = null,
            [FromQuery] int? groupId = null)
        {
            var query = _context.Students
                .Include(s => s.Family)
                .Include(s => s.Group)
                    .ThenInclude(g => g.Grade)
                        .ThenInclude(gr => gr.Level)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(s => 
                    s.FirstName.ToLower().Contains(search) || 
                    s.PaternalSurname.ToLower().Contains(search) || 
                    (s.MaternalSurname != null && s.MaternalSurname.ToLower().Contains(search)) ||
                    (s.Matricula != null && s.Matricula.ToLower().Contains(search))
                );
            }

            if (!string.IsNullOrEmpty(cycle))
            {
                query = query.Where(s => s.AdmissionCycle == cycle);
            }

            if (groupId.HasValue)
            {
                if (groupId == 0)
                {
                    // Filter for unassigned students (GroupId is null)
                    query = query.Where(s => s.GroupId == null);
                }
                else
                {
                    // Filter for specific group
                    query = query.Where(s => s.GroupId == groupId);
                }
            }

            // Pagination headers
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

            Response.Headers.Add("X-Total-Count", totalItems.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());

            return await query
                .OrderBy(s => s.PaternalSurname)
                .ThenBy(s => s.FirstName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // GET: api/Students/admissions/stats
        [HttpGet("admissions/stats")]
        public async Task<ActionResult<object>> GetAdmissionsStats([FromQuery] string currentCycle)
        {
            if (string.IsNullOrEmpty(currentCycle))
                return BadRequest("Current cycle is required");

            var newStudents = await _context.Students
                .Where(s => s.AdmissionCycle == currentCycle)
                .Include(s => s.Group).ThenInclude(g => g.Grade)
                .ToListAsync();

            var reEnrolled = await _context.Students
                .Where(s => s.AdmissionCycle != currentCycle && s.Status == "Activo")
                .Include(s => s.Group).ThenInclude(g => g.Grade)
                .ToListAsync();

            return Ok(new
            {
                NewStudentsCount = newStudents.Count,
                ReEnrolledCount = reEnrolled.Count,
                NewStudents = newStudents,
                ReEnrolled = reEnrolled
            });
        }

        // GET: api/Students/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Student>> GetStudent(long id)
        {
            var student = await _context.Students
                .Include(s => s.Family)
                .Include(s => s.Group)
                .Include(s => s.StudentGuardians)
                    .ThenInclude(sg => sg.Guardian)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (student == null)
            {
                return NotFound();
            }

            return student;
        }

        // POST: api/Students
        [HttpPost]
        public async Task<ActionResult<Student>> PostStudent(Student student)
        {
            student.CreatedAt = DateTime.UtcNow;
            student.UpdatedAt = DateTime.UtcNow;

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, student);
        }

        // PUT: api/Students/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutStudent(long id, Student student)
        {
            if (id != student.Id)
            {
                return BadRequest();
            }

            student.UpdatedAt = DateTime.UtcNow;
            _context.Entry(student).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StudentExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // POST: api/Students/5/photo
        [HttpPost("{id}/photo")]
        public async Task<IActionResult> UploadPhoto(long id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var student = await _context.Students.FindAsync(id);
            if (student == null)
                return NotFound("Student not found.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "StudentPhotos");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Save the unique filename in the DB
            student.PhotoUrl = uniqueFileName;
            student.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { url = $"/api/Students/{id}/photo" });
        }

        // GET: api/Students/5/photo
        [HttpGet("{id}/photo")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin,Teacher,Coordinator")]
        public async Task<IActionResult> GetPhoto(long id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null || string.IsNullOrEmpty(student.PhotoUrl))
                return NotFound();

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "App_Data", "StudentPhotos");
            var filePath = Path.Combine(uploadsFolder, student.PhotoUrl);

            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(filePath, out string? contentType))
            {
                contentType = "application/octet-stream";
            }

            return PhysicalFile(filePath, contentType);
        }

        // DELETE: api/Students/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(long id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null)
            {
                return NotFound();
            }

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool StudentExists(long id)
        {
            return _context.Students.Any(e => e.Id == id);
        }
    }
}
