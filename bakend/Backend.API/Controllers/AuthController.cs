using Backend.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly SupabaseDbContext _context;

        public AuthController(IConfiguration configuration, SupabaseDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            // 1. Check for Admin
            if (model.Username == "admin@edu.com" && model.Password == "password")
            {
                var token = GenerateJwtToken(model.Username, new[] { "Admin" }, null);
                return Ok(new
                {
                    token,
                    role = "Admin",
                    userId = (long?)null,
                    username = "Administrador"
                });
            }

            // 2. Check for Teacher
            var teacher = _context.Teachers.FirstOrDefault(t => t.Email == model.Username);
            if (teacher != null && model.Password == "teacher123") // Demo password
            {
                var token = GenerateJwtToken(teacher.Email ?? model.Username, new[] { "Teacher" }, teacher.Id);
                return Ok(new
                {
                    token,
                    role = "Teacher",
                    userId = teacher.Id,
                    username = teacher.FullName
                });
            }

            // 3. Check for Student
            var student = _context.Students.FirstOrDefault(s => s.Email == model.Username);
            if (student != null && model.Password == "student123") // Demo password
            {
                // Check if student has completed IQ test
                //bool hasCompletedIqTest = _context.StudentIqTestResults.Any(r => r.StudentId == student.Id);
                
                var token = GenerateJwtToken(student.Email ?? model.Username, new[] { "Student" }, student.Id);
                return Ok(new
                {
                    token,
                    role = "Student",
                    userId = student.Id,
                    username = $"{student.FirstName} {student.PaternalSurname}"
                  
                });
            }

            return Unauthorized(new { message = "Invalid credentials" });
        }

        [HttpGet("validate")]
        [Authorize]
        public IActionResult Validate()
        {
            var roles = User.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToArray();

            return Ok(new
            {
                isAuthenticated = true,
                roles = roles
            });
        }

        private string GenerateJwtToken(string username, string[] roles, long? userId)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);
            var tokenHandler = new JwtSecurityTokenHandler();
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username)
            };
            
            if (userId.HasValue)
            {
                claims.Add(new Claim("UserId", userId.Value.ToString()));
            }
            
            foreach(var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class LoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
