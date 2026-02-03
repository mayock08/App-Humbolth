class StudentActivity {
  final int id;
  final int studentId;
  final int activityId;
  final String status;
  final double? finalGrade;
  final DateTime assignedAt;
  final DateTime? submittedAt;
  final Activity? activity;

  StudentActivity({
    required this.id,
    required this.studentId,
    required this.activityId,
    required this.status,
    this.finalGrade,
    required this.assignedAt,
    this.submittedAt,
    this.activity,
  });

  factory StudentActivity.fromJson(Map<String, dynamic> json) {
    return StudentActivity(
      id: json['id'],
      studentId: json['studentId'],
      activityId: json['activityId'],
      status: json['status'] ?? 'ASSIGNED',
      finalGrade: json['finalGrade'] != null ? (json['finalGrade'] as num).toDouble() : null,
      assignedAt: DateTime.parse(json['assignedAt']),
      submittedAt: json['submittedAt'] != null ? DateTime.parse(json['submittedAt']) : null,
      activity: json['activity'] != null ? Activity.fromJson(json['activity']) : null,
    );
  }
}

class Activity {
  final int id;
  final String title;
  final String? description;
  final String? activityType;
  final DateTime createdAt;
  
  Activity({
    required this.id,
    required this.title,
    this.description,
    this.activityType,
    required this.createdAt,
  });
  
  factory Activity.fromJson(Map<String, dynamic> json) {
    return Activity(
      id: json['id'],
      title: json['title'] ?? '',
      description: json['description'],
      activityType: json['activityType'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
