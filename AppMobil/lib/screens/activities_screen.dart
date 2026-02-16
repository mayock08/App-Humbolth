import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_theme.dart';
import '../models/student_activity_model.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class ActivitiesScreen extends StatefulWidget {
  const ActivitiesScreen({super.key});

  @override
  State<ActivitiesScreen> createState() => _ActivitiesScreenState();
}

class _ActivitiesScreenState extends State<ActivitiesScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ApiService _apiService = ApiService();
  final AuthService _authService = AuthService();
  List<StudentActivity> _allActivities = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadActivities();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadActivities() async {
    try {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        final data = await _apiService.getStudentActivities(user.userId);
        setState(() {
          _allActivities = data.map((json) => StudentActivity.fromJson(json)).toList();
          // Sort by date descending
          _allActivities.sort((a, b) => b.assignedAt.compareTo(a.assignedAt));
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Usuario no identificado';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error al cargar actividades: $e';
        _isLoading = false;
      });
    }
  }

  List<StudentActivity> _filterActivities(String category) {
    if (category == 'ALL') return _allActivities;
    
    return _allActivities.where((sa) {
      final type = sa.activity?.activityType?.toUpperCase() ?? '';
      if (category == 'HOMEWORK') {
        return type == 'HOMEWORK' || type == 'TAREA';
      } else if (category == 'PROJECT') {
        return type == 'PROJECT' || type == 'PROYECTO';
      } else if (category == 'EXAM') {
        return type == 'EXAM' || type == 'QUIZ' || type == 'PARTIAL' || type == 'EXAMEN' || type == 'PARCIAL';
      }
      return false;
    }).toList();
  }

  Color _getColorForActivityType(String? type) {
    if (type == null) return AppTheme.accentBlue;
    final t = type.toUpperCase();
    if (t.contains('EXAM') || t.contains('PARCIAL')) return AppTheme.accentRed;
    if (t.contains('HOMEWORK') || t.contains('TAREA')) return AppTheme.accentOrange;
    if (t.contains('PROJECT') || t.contains('PROYECTO')) return AppTheme.accentPurple;
    if (t.contains('QUIZ')) return AppTheme.accentGreen;
    return AppTheme.accentBlue;
  }

  IconData _getIconForActivityType(String? type) {
    if (type == null) return Icons.assignment_outlined;
    final t = type.toUpperCase();
    if (t.contains('EXAM') || t.contains('PARCIAL')) return Icons.timer_outlined;
    if (t.contains('HOMEWORK') || t.contains('TAREA')) return Icons.home_work_outlined;
    if (t.contains('PROJECT') || t.contains('PROYECTO')) return Icons.rocket_launch_outlined;
    if (t.contains('QUIZ')) return Icons.quiz_outlined;
    return Icons.assignment_outlined;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      appBar: AppBar(
        backgroundColor: AppTheme.primaryDark,
        elevation: 0,
        title: const Text('Mis Tareas'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.accentBlue,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          isScrollable: true, // Allow scrolling if needed on small screens
          tabs: const [
            Tab(text: 'Todas'),
            Tab(text: 'Tareas'),
            Tab(text: 'Proyectos'),
            Tab(text: 'Exámenes'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              setState(() {
                _isLoading = true;
                _error = null;
              });
              _loadActivities();
            },
          ),
        ],
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
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildActivityList(_filterActivities('ALL')),
                    _buildActivityList(_filterActivities('HOMEWORK')),
                    _buildActivityList(_filterActivities('PROJECT')),
                    _buildActivityList(_filterActivities('EXAM')),
                  ],
                ),
    );
  }

  Widget _buildActivityList(List<StudentActivity> activities) {
    if (activities.isEmpty) {
      return const Center(
        child: Text(
          'No hay actividades en esta categoría',
          style: TextStyle(color: Colors.white70),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: activities.length,
      itemBuilder: (context, index) {
        final sa = activities[index];
        final activity = sa.activity;
        final color = _getColorForActivityType(activity?.activityType);
        final icon = _getIconForActivityType(activity?.activityType);
        final formattedDate = sa.assignedAt != null 
            ? DateFormat('d MMM y', 'es').format(sa.assignedAt) 
            : 'Sin fecha';

        return Padding(
          padding: const EdgeInsets.only(bottom: 16.0),
          child: _buildActivityCard(
            icon: icon,
            title: activity?.title ?? 'Actividad sin título',
            date: formattedDate,
            status: sa.status,
            type: activity?.activityType ?? 'General',
            color: color,
            finalGrade: sa.finalGrade,
          ),
        );
      },
    );
  }

  Widget _buildActivityCard({
    required IconData icon,
    required String title,
    required String date,
    required String status,
    required String type,
    required Color color,
    double? finalGrade,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      type.toUpperCase(),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Asignada',
                    style: TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                  Text(
                    date,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'Estado',
                    style: TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: status == 'COMPLETED' || status == 'SUBMITTED' 
                          ? Colors.green.withOpacity(0.2) 
                          : Colors.orange.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(
                        color: status == 'COMPLETED' || status == 'SUBMITTED' 
                            ? Colors.green 
                            : Colors.orange,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (finalGrade != null) ...[
             const SizedBox(height: 12),
             Divider(color: Colors.white.withOpacity(0.1)),
             const SizedBox(height: 8),
             Row(
               mainAxisAlignment: MainAxisAlignment.spaceBetween,
               children: [
                 const Text('Calificación Final:', style: TextStyle(color: Colors.white70)),
                 Text(
                   finalGrade.toString(),
                   style: const TextStyle(
                     color: Colors.white, 
                     fontWeight: FontWeight.bold,
                     fontSize: 16
                   ),
                 ),
               ],
             ),
          ],
        ],
      ),
    );
  }
}
