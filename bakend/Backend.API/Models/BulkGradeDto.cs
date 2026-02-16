namespace Backend.API.Models
{
    public class BulkGradeDto
    {
        public long EvaluationId { get; set; }
        public long StudentId { get; set; }
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
    }
}
