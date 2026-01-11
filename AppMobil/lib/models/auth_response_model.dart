class AuthResponse {
  final String token;
  final String role;
  final String userId;
  final String username;
  final bool hasCompletedIqTest;

  AuthResponse({
    required this.token,
    required this.role,
    required this.userId,
    required this.username,
    required this.hasCompletedIqTest,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      hasCompletedIqTest: json['hasCompletedIqTest'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'role': role,
      'userId': userId,
      'username': username,
      'hasCompletedIqTest': hasCompletedIqTest,
    };
  }
}
