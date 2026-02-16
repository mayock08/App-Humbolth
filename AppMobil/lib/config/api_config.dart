class ApiConfig {
  // Base URL del backend .NET
  static const String baseUrl = 'http://institutohumboldt.mx:8080/api';
  
  // Endpoints
  static const String authLogin = '$baseUrl/Auth/login';
  static const String studentProfile = '$baseUrl/StudentProfile';
  static const String courses = '$baseUrl/Courses';
  static const String activities = '$baseUrl/Activities';
  static const String studentActivities = '$baseUrl/Activities/student';
  static const String studentAttendance = '$baseUrl/Attendances/student';
  static const String studentNotifications = '$baseUrl/Notifications/student';
  static const String studentIncidents = '$baseUrl/Incidents/student';
  
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
