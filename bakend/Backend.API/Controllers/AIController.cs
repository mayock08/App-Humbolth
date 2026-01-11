using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace Backend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;

        public AIController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        // POST: api/AI/chat
        [HttpPost("chat")]
        public async Task<ActionResult<object>> Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return BadRequest(new { error = "El prompt no puede estar vacío" });
            }

            try
            {
                // Get AI configuration from appsettings
                var aiEndpoint = _configuration["AI:Endpoint"];
                var aiApiKey = _configuration["AI:ApiKey"];
                var aiModel = _configuration["AI:Model"] ?? "gpt-3.5-turbo";

                if (string.IsNullOrEmpty(aiEndpoint))
                {
                    return Ok(new
                    {
                        response = "El servicio de IA no está configurado. Por favor, configura el endpoint en appsettings.json."
                    });
                }

                var client = _httpClientFactory.CreateClient();
                
                // Prepare the request for OpenAI-compatible API
                var aiRequest = new
                {
                    model = aiModel,
                    messages = new[]
                    {
                        new
                        {
                            role = "system",
                            content = "Eres un asistente especializado en gestión escolar. Ayudas a maestros y administradores con información sobre estudiantes, calificaciones, asistencias y gestión académica. Responde de manera clara, concisa y profesional en español."
                        },
                        new
                        {
                            role = "user",
                            content = request.Prompt
                        }
                    },
                    temperature = 0.7,
                    max_tokens = 500
                };

                var jsonContent = JsonSerializer.Serialize(aiRequest);
                var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                // Add API key if provided
                if (!string.IsNullOrEmpty(aiApiKey))
                {
                    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {aiApiKey}");
                }

                var response = await client.PostAsync(aiEndpoint, httpContent);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var aiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    
                    // Extract the response text (OpenAI format)
                    var messageContent = aiResponse
                        .GetProperty("choices")[0]
                        .GetProperty("message")
                        .GetProperty("content")
                        .GetString();

                    return Ok(new { response = messageContent });
                }
                else
                {
                    return Ok(new
                    {
                        response = $"Error al comunicarse con el servicio de IA: {response.StatusCode}. Detalles: {responseContent}"
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    response = $"Ocurrió un error al procesar tu solicitud: {ex.Message}"
                });
            }
        }

        // POST: api/AI/analyze-student
        [HttpPost("analyze-student")]
        public async Task<ActionResult<object>> AnalyzeStudent([FromBody] StudentAnalysisRequest request)
        {
            // This endpoint could analyze student data and provide insights
            // For now, return a placeholder response
            return Ok(new
            {
                response = $"Análisis del estudiante {request.StudentId}: Esta funcionalidad estará disponible próximamente con integración completa de IA."
            });
        }
    }

    public class ChatRequest
    {
        public string Prompt { get; set; } = string.Empty;
    }

    public class StudentAnalysisRequest
    {
        public long StudentId { get; set; }
        public string? Context { get; set; }
    }
}
