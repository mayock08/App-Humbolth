class NotificationModel {
  final int id;
  final int studentId;
  final String title;
  final String message;
  final String type;
  final int? referenceId;
  final bool isRead;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.studentId,
    required this.title,
    required this.message,
    required this.type,
    this.referenceId,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      studentId: json['studentId'] is int ? json['studentId'] : int.parse(json['studentId'].toString()),
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'General',
      referenceId: json['referenceId'] != null 
          ? (json['referenceId'] is int ? json['referenceId'] : int.parse(json['referenceId'].toString()))
          : null,
      isRead: json['isRead'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
