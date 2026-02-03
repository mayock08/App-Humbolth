class Attendance {
  final int id;
  final int studentId;
  final int courseId;
  final DateTime classDate;
  final String status;
  final String? note;
  final CourseSummary? course;

  Attendance({
    required this.id,
    required this.studentId,
    required this.courseId,
    required this.classDate,
    required this.status,
    this.note,
    this.course,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) {
    return Attendance(
      id: json['id'],
      studentId: json['studentId'],
      courseId: json['courseId'],
      classDate: DateTime.parse(json['classDate']),
      status: json['status'] ?? 'A',
      note: json['note'],
      course: json['course'] != null ? CourseSummary.fromJson(json['course']) : null,
    );
  }
}

class CourseSummary {
  final int id;
  final String name;
  final String grade;

  CourseSummary({required this.id, required this.name, required this.grade});

  factory CourseSummary.fromJson(Map<String, dynamic> json) {
    return CourseSummary(
      id: json['id'],
      name: json['name'] ?? '',
      grade: json['grade'] ?? '',
    );
  }
}
