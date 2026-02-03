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

class _ActivitiesScreenState extends State<ActivitiesScreen> {
  int _selectedIndex = 2;
  final ApiService _apiService = ApiService();
  final AuthService _authService = AuthService();
  List<StudentActivity> _activities = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadActivities();
  }

  Future<void> _loadActivities() async {
    try {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        final data = await _apiService.getStudentActivities(user.userId);
        setState(() {
          _activities = data.map((json) => StudentActivity.fromJson(json)).toList();
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

  Color _getColorForActivityType(String? type) {
    if (type == null) return AppTheme.accentBlue;
    switch (type.toUpperCase()) {
      case 'EXAM':
        return AppTheme.accentRed;
      case 'HOMEWORK':
        return AppTheme.accentOrange;
      case 'PROJECT':
        return AppTheme.accentPurple;
      case 'QUIZ':
        return AppTheme.accentGreen;
      default:
        return AppTheme.accentBlue;
    }
  }

  IconData _getIconForActivityType(String? type) {
    if (type == null) return Icons.assignment_outlined;
    switch (type.toUpperCase()) {
      case 'EXAM':
        return Icons.timer_outlined;
      case 'HOMEWORK':
        return Icons.home_work_outlined;
      case 'PROJECT':
        return Icons.rocket_launch_outlined;
      case 'QUIZ':
        return Icons.quiz_outlined;
      default:
        return Icons.assignment_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      appBar: AppBar(
        backgroundColor: AppTheme.primaryDark,
        title: const Text('Actividades'),
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
              : _activities.isEmpty
                  ? const Center(
                      child: Text(
                        'No tienes actividades pendientes',
                        style: TextStyle(color: Colors.white70),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(20),
                      itemCount: _activities.length,
                      itemBuilder: (context, index) {
                        final sa = _activities[index];
                        final activity = sa.activity;
                        final color = _getColorForActivityType(activity?.activityType);
                        final icon = _getIconForActivityType(activity?.activityType);
                        final formattedDate = DateFormat('d MMM y').format(sa.assignedAt);

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16.0),
                          child: _buildActivityCard(
                            icon: icon,
                            title: activity?.title ?? 'Actividad sin título',
                            subtitle: 'Asignada: $formattedDate\nEstado: ${sa.status}',
                            color: color,
                          ),
                        );
                      },
                    ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: AppTheme.primaryDark,
        selectedItemColor: AppTheme.accentBlue,
        unselectedItemColor: Colors.white38,
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() => _selectedIndex = index);
          if (index == 0) Navigator.pop(context);
        },
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            label: '',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined),
            label: '',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_outlined),
            label: '',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.message_outlined),
            label: '',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: '',
          ),
        ],
      ),
    );
  }

  Widget _buildActivityCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
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
                  subtitle,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white60,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
