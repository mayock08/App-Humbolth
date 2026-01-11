import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/user_model.dart';
import '../models/auth_response_model.dart';
import 'api_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final ApiService _apiService = ApiService();
  
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Login with username and password
  Future<User> login(String username, String password) async {
    try {
      final response = await _apiService.post(
        ApiConfig.authLogin,
        {
          'username': username,
          'password': password,
        },
        includeAuth: false,
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponse.fromJson(jsonDecode(response.body));
        
        // Create user object
        final user = User(
          userId: authResponse.userId,
          username: authResponse.username,
          role: authResponse.role,
          token: authResponse.token,
          hasCompletedIqTest: authResponse.hasCompletedIqTest,
        );

        // Store token and user data
        await _storeUserData(user);
        _apiService.setToken(user.token);

        return user;
      } else if (response.statusCode == 401) {
        throw Exception('Credenciales inválidas');
      } else {
        throw Exception('Error al iniciar sesión');
      }
    } catch (e) {
      if (e.toString().contains('SocketException') || 
          e.toString().contains('TimeoutException')) {
        throw Exception('Error de conexión. Verifica tu internet.');
      }
      rethrow;
    }
  }

  // Store user data in SharedPreferences
  Future<void> _storeUserData(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, user.token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  // Get stored token
  Future<String?> getStoredToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Get current user from storage
  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString(_userKey);
    
    if (userData != null) {
      return User.fromJson(jsonDecode(userData));
    }
    return null;
  }

  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getStoredToken();
    if (token != null && token.isNotEmpty) {
      _apiService.setToken(token);
      return true;
    }
    return false;
  }

  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    _apiService.clearToken();
  }
}
