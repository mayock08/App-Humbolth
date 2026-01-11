import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

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
}
