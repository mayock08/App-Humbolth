using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.API.Models;

namespace Backend.API.Services
{
    public class MockDebtService : IDebtService
    {
        public Task<List<Debt>> GetDebtsForStudentAsync(string studentId)
        {
            // Simulate external service call
            var debts = new List<Debt>();

            // Mock logic: some students have debts, others don't
            // For testing, let's say student ID '1' has debts.
            
            if (studentId == "1" || studentId == "10") 
            {
                debts.Add(new Debt
                {
                    Concept = "Colegiatura Febrero 2024",
                    Amount = 4500.00m,
                    DueDate = DateTime.Now.AddDays(5),
                    Status = "PENDING",
                    Reference = "REF-FEB-24-001"
                });

                debts.Add(new Debt
                {
                    Concept = "Seguro Escolar Anual",
                    Amount = 1200.00m,
                    DueDate = DateTime.Now.AddDays(-10), // Overdue
                    Status = "OVERDUE",
                    Reference = "REF-INS-24-999"
                });
            }

            return Task.FromResult(debts);
        }
    }
}
