using System.Linq;
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
            .OrderBy(s => s.PaternalLastName)
            .ThenBy(s => s.MaternalLastName)
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
        student.LastName = NormalizeLastName(student.LastName, student.PaternalLastName, student.MaternalLastName);
        student.FullName = NormalizeFullName(student.FullName, student.FirstName, student.PaternalLastName, student.MaternalLastName);

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
        student.LastName = NormalizeLastName(updatedStudent.LastName, updatedStudent.PaternalLastName, updatedStudent.MaternalLastName);
        student.FullName = NormalizeFullName(updatedStudent.FullName, updatedStudent.FirstName, updatedStudent.PaternalLastName, updatedStudent.MaternalLastName);
        student.PaternalLastName = updatedStudent.PaternalLastName;
        student.MaternalLastName = updatedStudent.MaternalLastName;
        student.FatherFullName = updatedStudent.FatherFullName;
        student.MotherFullName = updatedStudent.MotherFullName;
        student.Email = updatedStudent.Email;
        student.DateOfBirth = updatedStudent.DateOfBirth;
        student.HealthStatus = updatedStudent.HealthStatus;
        student.BloodType = updatedStudent.BloodType;
        student.HasChronicIllness = updatedStudent.HasChronicIllness;
        student.ChronicIllnessDetails = updatedStudent.ChronicIllnessDetails;
        student.ConcurrentContactNames = updatedStudent.ConcurrentContactNames;
        student.Observations = updatedStudent.Observations;

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

    private static string NormalizeLastName(string currentLastName, string paternalLastName, string maternalLastName)
    {
        if (!string.IsNullOrWhiteSpace(currentLastName))
        {
            return currentLastName.Trim();
        }

        return string.Join(' ', new[] { paternalLastName, maternalLastName }
            .Where(part => !string.IsNullOrWhiteSpace(part))
            .Select(part => part.Trim()))
            .Trim();
    }

    private static string NormalizeFullName(string currentFullName, string firstName, string paternalLastName, string maternalLastName)
    {
        if (!string.IsNullOrWhiteSpace(currentFullName))
        {
            return currentFullName.Trim();
        }

        var components = new[] { firstName, paternalLastName, maternalLastName }
            .Where(part => !string.IsNullOrWhiteSpace(part))
            .Select(part => part.Trim());

        return string.Join(' ', components).Trim();
    }
}
