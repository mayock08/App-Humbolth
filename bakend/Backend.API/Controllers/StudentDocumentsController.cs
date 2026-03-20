using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentDocumentsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public StudentDocumentsController(SupabaseDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/StudentDocuments/student/5
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentDocument>>> GetStudentDocuments(long studentId)
        {
            return await _context.StudentDocuments
                .Where(d => d.StudentId == studentId)
                .OrderByDescending(d => d.UploadedAt)
                .ToListAsync();
        }

        // POST: api/StudentDocuments/student/5
        [HttpPost("student/{studentId}")]
        public async Task<ActionResult<StudentDocument>> UploadDocument(long studentId, [FromForm] IFormFile file, [FromForm] string documentType)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var student = await _context.Students.FindAsync(studentId);
            if (student == null)
                return NotFound("Student not found.");

            // Create directory
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads", "documents", studentId.ToString());
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Unique filename
            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var document = new StudentDocument
            {
                StudentId = studentId,
                DocumentType = documentType,
                FileName = file.FileName,
                FilePath = $"/uploads/documents/{studentId}/{uniqueFileName}",
                FileType = file.ContentType,
                FileSize = file.Length,
                Status = "Pending"
            };

            _context.StudentDocuments.Add(document);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStudentDocuments), new { studentId = studentId }, document);
        }

        // DELETE: api/StudentDocuments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(long id)
        {
            var document = await _context.StudentDocuments.FindAsync(id);
            if (document == null)
                return NotFound();

            // Delete file from disk
            // Sanitize path to prevent traversal
            var relativePath = document.FilePath?.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            if (!string.IsNullOrEmpty(relativePath))
            {
                var fullPath = Path.Combine(_environment.WebRootPath ?? "wwwroot", relativePath);
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }

            _context.StudentDocuments.Remove(document);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/StudentDocuments/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateStatusDto model)
        {
            var document = await _context.StudentDocuments.FindAsync(id);
            if (document == null) return NotFound();

            document.Status = model.Status;
            document.RejectionReason = model?.RejectionReason;
            document.ReviewedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
    }
}
