import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/debt_model.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;

  void setToken(String token) {
    _token = token;
  }

  void clearToken() {
    _token = null;
  }

  Map<String, String> _getHeaders({bool includeAuth = true}) {
    final headers = {...ApiConfig.defaultHeaders};
    if (includeAuth && _token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Future<http.Response> get(String endpoint, {bool includeAuth = true}) async {
    try {
      final response = await http
          .get(
            Uri.parse(endpoint),
            headers: _getHeaders(includeAuth: includeAuth),
          )
          .timeout(ApiConfig.connectionTimeout);
      return response;
    } catch (e) {
      rethrow;
    }
  }

  Future<http.Response> post(
    String endpoint,
    Map<String, dynamic> body, {
    bool includeAuth = true,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse(endpoint),
            headers: _getHeaders(includeAuth: includeAuth),
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.connectionTimeout);
      return response;
    } catch (e) {
      rethrow;
    }
  }

  Future<http.Response> put(
    String endpoint,
    Map<String, dynamic> body, {
    bool includeAuth = true,
  }) async {
    try {
      final response = await http
          .put(
            Uri.parse(endpoint),
            headers: _getHeaders(includeAuth: includeAuth),
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.connectionTimeout);
      return response;
    } catch (e) {
      rethrow;
    }
  }

  Future<http.Response> delete(String endpoint, {bool includeAuth = true}) async {
    try {
      final response = await http
          .delete(
            Uri.parse(endpoint),
            headers: _getHeaders(includeAuth: includeAuth),
          )
          .timeout(ApiConfig.connectionTimeout);
      return response;
    } catch (e) {
      rethrow;
    }
  }

  // New methods for Student Activities and Attendance

  Future<List<dynamic>> getStudentActivities(String studentId) async {
    try {
      final response = await get(
        '${ApiConfig.studentActivities}/$studentId',
        includeAuth: true,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load activities: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getStudentAttendance(String studentId) async {
    try {
      final response = await get(
        '${ApiConfig.studentAttendance}/$studentId',
        includeAuth: true,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load attendance: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getStudentProfile(String studentId) async {
    try {
      final response = await get(
        '${ApiConfig.studentProfile}/$studentId',
        includeAuth: true,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load profile: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getStudentNotifications(String studentId) async {
    try {
      final response = await get(
        '${ApiConfig.studentNotifications}/$studentId',
        includeAuth: true,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load notifications: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<List<dynamic>> getStudentIncidents(String studentId) async {
    try {
      final response = await get(
        '${ApiConfig.studentIncidents}/$studentId',
        includeAuth: true,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to load incidents: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<dynamic> getActiveIqTest(String studentId) async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/IqTests/student/$studentId/active'));

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else if (response.statusCode == 204) {
      return null;
    } else {
      throw Exception('Failed to load active IQ Test');
    }
  }

  Future<void> submitIqTest(Map<String, dynamic> attemptData) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/IqTests/submit'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(attemptData),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to submit IQ Test');
    }
  }

  Future<List<DebtModel>> getStudentDebts(String studentId) async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/Debts/student/$studentId'));

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => DebtModel.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load debts');
    }
  }

  Future<String> sendAdminChatMessage(String message, String userId) async {
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/N8N/chat'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'message': message, 'userId': userId}),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['response'] ?? 'Sin respuesta';
    } else {
      throw Exception('Failed to communicate with AI Assistant');
    }
  }
}
