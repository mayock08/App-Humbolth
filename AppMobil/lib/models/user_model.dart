class User {
  final String userId;
  final String username;
  final String role;
  final String token;
  final bool hasCompletedIqTest;

  User({
    required this.userId,
    required this.username,
    required this.role,
    required this.token,
    required this.hasCompletedIqTest,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['userId']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      role: json['role']?.toString() ?? '',
      token: json['token']?.toString() ?? '',
      hasCompletedIqTest: json['hasCompletedIqTest'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'role': role,
      'token': token,
      'hasCompletedIqTest': hasCompletedIqTest,
    };
  }
}
