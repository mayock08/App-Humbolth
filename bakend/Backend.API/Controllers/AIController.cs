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

        // POST: api/AI/generate-iq-questions
        [HttpPost("generate-iq-questions")]
        public async Task<ActionResult<object>> GenerateIqQuestions([FromBody] GenerateIqRequest request)
        {
            try
            {
                var aiEndpoint = _configuration["AI:Endpoint"];
                var aiApiKey = _configuration["AI:ApiKey"];
                var aiModel = _configuration["AI:Model"] ?? "gpt-3.5-turbo";

                if (string.IsNullOrEmpty(aiEndpoint) || string.IsNullOrEmpty(aiApiKey))
                {
                    // Return a mock payload so the UI can be tested without a real API Key
                    var mockResponse = new {
                        sections = new[] {
                            new { 
                                name = $"Sección Práctica de {request.TargetSkill}",
                                questions = new[] {
                                    new {
                                        text = $"[Autogenerado - Falta API Key] ¿Ejemplo de pregunta lógica sobre {request.TargetSkill} nivel {request.Difficulty}?",
                                        difficulty = 2,
                                        abilityDomain = request.TargetSkill,
                                        options = new[] {
                                            new { optionKey = "A", text = "Opción incorrecta 1", isCorrect = false },
                                            new { optionKey = "B", text = "Opción incorrecta 2", isCorrect = false },
                                            new { optionKey = "C", text = "Opción correcta de análisis", isCorrect = true },
                                            new { optionKey = "D", text = "Opción incorrecta 3", isCorrect = false }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    return Ok(mockResponse);
                }

                var extraContext = string.IsNullOrWhiteSpace(request.CustomPrompt) ? "" : $"\n\nCONTEXTO TEMÁTICO/PERFIL (Obligatorio aplicar esto al tono de las preguntas): {request.CustomPrompt}";
                var prompt = $@"Eres un psicómetra educativo experto. Tu objetivo es generar reactivos para un examen de {request.TargetSkill} adaptado para estudiantes de nivel {request.EducationalLevel}. El nivel de dificultad debe ser {request.Difficulty}. Genera {request.Count} preguntas de opción múltiple con 4 opciones.{extraContext}

DEVUELVE ÚNICAMENTE UN ARCHIVO JSON VÁLIDO con esta estructura:
{{
  ""sections"": [
    {{
      ""name"": ""Sección {request.TargetSkill}"",
      ""questions"": [
        {{
          ""text"": ""¿Cuestión lógica...?"",
          ""difficulty"": 2,
          ""abilityDomain"": ""{request.TargetSkill}"",
          ""options"": [
            {{ ""optionKey"": ""A"", ""text"": ""Resp 1"", ""isCorrect"": false }},
            {{ ""optionKey"": ""B"", ""text"": ""Resp 2"", ""isCorrect"": true }}
          ]
        }}
      ]
    }}
  ]
}}";

                var aiRequest = new
                {
                    model = aiModel,
                    response_format = new { type = "json_object" },
                    messages = new[]
                    {
                        new { role = "system", content = "Eres un asistente de psicología educativa que responde ÚNICAMENTE en JSON válido sin formato markdown extra." },
                        new { role = "user", content = prompt }
                    },
                    temperature = 0.7
                };

                var client = _httpClientFactory.CreateClient();
                if (!string.IsNullOrEmpty(aiApiKey))
                {
                    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {aiApiKey}");
                }

                var jsonContent = JsonSerializer.Serialize(aiRequest);
                var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await client.PostAsync(aiEndpoint, httpContent);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var aiResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    var messageContent = aiResponse.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();
                    
                    if (messageContent != null)
                    {
                        // Return the raw parsed JSON so frontend can use it directly
                        var parsedResult = JsonSerializer.Deserialize<JsonElement>(messageContent);
                        return Ok(parsedResult);
                    }
                }
                
                return StatusCode(500, new { error = "Error desde el servicio AI.", details = responseContent });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ocurrió un error al procesar:", details = ex.Message });
            }
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

    public class GenerateIqRequest
    {
        public string TargetSkill { get; set; } = "General";
        public string Difficulty { get; set; } = "Media";
        public int Count { get; set; } = 5;
        public string EducationalLevel { get; set; } = "Primaria";
        public string? CustomPrompt { get; set; }
    }
}
