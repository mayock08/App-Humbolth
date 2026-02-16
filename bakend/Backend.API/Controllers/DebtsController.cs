using Microsoft.AspNetCore.Mvc;
using Backend.API.Services;
using Backend.API.Models;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebtsController : ControllerBase
    {
        private readonly IDebtService _debtService;

        public DebtsController(IDebtService debtService)
        {
            _debtService = debtService;
        }

        // GET: api/debts/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<List<Debt>>> GetStudentDebts(string studentId)
        {
            var debts = await _debtService.GetDebtsForStudentAsync(studentId);
            return Ok(debts);
        }
    }
}
