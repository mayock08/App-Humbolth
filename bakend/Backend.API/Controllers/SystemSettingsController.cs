using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemSettingsController : ControllerBase
    {
        private readonly SupabaseDbContext _context;

        public SystemSettingsController(SupabaseDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SystemSetting>>> GetSettings()
        {
            return await _context.SystemSettings.ToListAsync();
        }

        [HttpGet("{key}")]
        public async Task<ActionResult<SystemSetting>> GetSetting(string key)
        {
            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == key);
            if (setting == null) return NotFound();
            return setting;
        }

        [HttpPost]
        public async Task<IActionResult> SaveSetting([FromBody] SystemSetting dto)
        {
            var existing = await _context.SystemSettings.FirstOrDefaultAsync(s => s.SettingKey == dto.SettingKey);
            if (existing != null)
            {
                existing.SettingValue = dto.SettingValue;
                existing.Description = dto.Description;
                existing.UpdatedAt = System.DateTime.UtcNow;
                _context.Entry(existing).State = EntityState.Modified;
            }
            else
            {
                dto.UpdatedAt = System.DateTime.UtcNow;
                _context.SystemSettings.Add(dto);
            }

            await _context.SaveChangesAsync();
            return Ok(existing ?? dto);
        }
    }
}
