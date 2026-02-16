class DebtModel {
  final String concept;
  final double amount;
  final DateTime dueDate;
  final String status;
  final String reference;

  DebtModel({
    required this.concept,
    required this.amount,
    required this.dueDate,
    required this.status,
    required this.reference,
  });

  factory DebtModel.fromJson(Map<String, dynamic> json) {
    return DebtModel(
      concept: json['concept'],
      amount: (json['amount'] as num).toDouble(),
      dueDate: DateTime.parse(json['dueDate']),
      status: json['status'],
      reference: json['reference'],
    );
  }
}
