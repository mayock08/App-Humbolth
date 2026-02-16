using System;

namespace Backend.API.Models
{
    public class Debt
    {
        public string Concept { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = "PENDING"; // PENDING, OVERDUE, PAID
        public string Reference { get; set; } = string.Empty;
    }
}
