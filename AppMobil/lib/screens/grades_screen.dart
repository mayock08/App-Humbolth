import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class GradesScreen extends StatefulWidget {
  const GradesScreen({super.key});

  @override
  State<GradesScreen> createState() => _GradesScreenState();
}

class _GradesScreenState extends State<GradesScreen> {
  final ApiService _apiService = ApiService();
  final AuthService _authService = AuthService();
  List<dynamic> _grades = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadGrades();
  }

  Future<void> _loadGrades() async {
    try {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        final profile = await _apiService.getStudentProfile(user.userId);
        if (profile.containsKey('grades')) {
          setState(() {
            _grades = profile['grades']; // Note: JSON keys from API might be camelCase (Grades or grades). Backend uses "Grades" (PascalCase).
            // Need to verify case sensitivity. ASP.NET usually serializes to camelCase by default.
            // Let's assume camelCase "grades".
            _isLoading = false;
          });
        } else if (profile.containsKey('Grades')) {
             setState(() {
            _grades = profile['Grades'];
            _isLoading = false;
          });
        } else {
             setState(() {
            _grades = [];
            _isLoading = false;
          });
        }
      } else {
        setState(() {
          _error = 'Usuario no identificado';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error al cargar calificaciones: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      appBar: AppBar(
        backgroundColor: AppTheme.primaryDark,
        title: const Text('Boleta de Calificaciones'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Text(
                    _error!,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                )
              : _grades.isEmpty
                  ? const Center(
                      child: Text(
                        'No hay calificaciones registradas',
                        style: TextStyle(color: Colors.white70),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: _grades.length,
                      itemBuilder: (context, index) {
                        final subject = _grades[index];
                        final subjectName = subject['subject'] ?? subject['Subject'] ?? 'Materia';
                        final average = subject['average'] ?? subject['Average'] ?? 0.0;
                        final evaluations = (subject['evaluations'] ?? subject['Evaluations'] ?? []) as List;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: AppTheme.cardDark,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Theme(
                            data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                            child: ExpansionTile(
                              title: Text(
                                subjectName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              trailing: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: average >= 70 ? AppTheme.accentGreen.withOpacity(0.2) : AppTheme.accentRed.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  average.toStringAsFixed(1),
                                  style: TextStyle(
                                    color: average >= 70 ? AppTheme.accentGreen : AppTheme.accentRed,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                              children: evaluations.map<Widget>((eval) {
                                final title = eval['title'] ?? eval['Title'] ?? 'Evaluación';
                                final score = eval['score'] ?? eval['Score'] ?? 0.0;
                                final weight = eval['weight'] ?? eval['Weight'] ?? 0;
                                
                                return Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        title,
                                        style: const TextStyle(color: Colors.white70),
                                      ),
                                      Row(
                                        children: [
                                          Text(
                                            '$weight%',
                                            style: const TextStyle(color: Colors.white38, fontSize: 12),
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            score.toString(),
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
