namespace backend.Models;

public class Student
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string PaternalLastName { get; set; } = string.Empty;

    public string MaternalLastName { get; set; } = string.Empty;

    public string FatherFullName { get; set; } = string.Empty;

    public string MotherFullName { get; set; } = string.Empty;

    public DateOnly DateOfBirth { get; set; }

    public string Email { get; set; } = string.Empty;

    public string HealthStatus { get; set; } = string.Empty;

    public string BloodType { get; set; } = string.Empty;

    public bool HasChronicIllness { get; set; }

    public string ChronicIllnessDetails { get; set; } = string.Empty;

    public string ConcurrentContactNames { get; set; } = string.Empty;

    public string Observations { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
