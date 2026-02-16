class IncidentModel {
  final int id;
  final int studentId;
  final String title;
  final String? description;
  final DateTime date;
  final String status;
  final String? typeName;
  final String? severity;
  final String? reporterName;

  IncidentModel({
    required this.id,
    required this.studentId,
    required this.title,
    this.description,
    required this.date,
    required this.status,
    this.typeName,
    this.severity,
    this.reporterName,
  });

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    return IncidentModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      studentId: json['studentId'] is int ? json['studentId'] : int.parse(json['studentId'].toString()),
      title: json['title'] ?? '',
      description: json['description'],
      date: DateTime.parse(json['date']),
      status: json['status'] ?? 'Abierto',
      typeName: json['type']?['name'],
      severity: json['type']?['severity'],
      reporterName: json['reporter']?['fullName'],
    );
  }
}
