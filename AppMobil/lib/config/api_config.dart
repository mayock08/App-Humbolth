class ApiConfig {
  // Base URL del backend .NET
  static const String baseUrl = 'http://localhost:5246/api';
  
  // Endpoints
  static const String authLogin = '$baseUrl/Auth/login';
  static const String studentProfile = '$baseUrl/StudentProfile';
  static const String courses = '$baseUrl/Courses';
  static const String activities = '$baseUrl/Activities';
  
  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  
  // Headers
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  static Map<String, String> authHeaders(String token) => {
    ...defaultHeaders,
    'Authorization': 'Bearer $token',
  };
}
