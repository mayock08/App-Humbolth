using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.API.Models;

namespace Backend.API.Services
{
    public interface IDebtService
    {
        Task<List<Debt>> GetDebtsForStudentAsync(string studentId);
    }
}
