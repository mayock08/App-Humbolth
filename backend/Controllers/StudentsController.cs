using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController(AppDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Student>>> GetStudents(CancellationToken cancellationToken)
    {
        var students = await context.Students
            .OrderBy(s => s.LastName)
            .ThenBy(s => s.FirstName)
            .ToListAsync(cancellationToken);

        return Ok(students);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Student>> GetStudent(int id, CancellationToken cancellationToken)
    {
        var student = await context.Students.FindAsync([id], cancellationToken);

        if (student is null)
        {
            return NotFound();
        }

        return Ok(student);
    }

    [HttpPost]
    public async Task<ActionResult<Student>> CreateStudent(Student student, CancellationToken cancellationToken)
    {
        context.Students.Add(student);
        await context.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, student);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateStudent(int id, Student updatedStudent, CancellationToken cancellationToken)
    {
        if (id != updatedStudent.Id)
        {
            return BadRequest("The student ID from the route must match the payload.");
        }

        var student = await context.Students.FindAsync([id], cancellationToken);
        if (student is null)
        {
            return NotFound();
        }

        student.FirstName = updatedStudent.FirstName;
        student.LastName = updatedStudent.LastName;
        student.Email = updatedStudent.Email;
        student.DateOfBirth = updatedStudent.DateOfBirth;

        await context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteStudent(int id, CancellationToken cancellationToken)
    {
        var student = await context.Students.FindAsync([id], cancellationToken);
        if (student is null)
        {
            return NotFound();
        }

        context.Students.Remove(student);
        await context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
