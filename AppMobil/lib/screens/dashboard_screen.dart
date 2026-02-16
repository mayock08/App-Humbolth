import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/menu_card.dart';
import 'credential_screen.dart';
import 'notifications_screen.dart';
import 'attendance_detail_screen.dart';
import 'activities_screen.dart';
import 'reports_screen.dart';
import 'debts_screen.dart';
import 'admin_chat_screen.dart';
import 'iq_test_screen.dart';
import '../models/iq_test_model.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';
import 'login_screen.dart';
import 'grades_screen.dart';


class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  final AuthService _authService = AuthService();
  User? _currentUser;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final user = await _authService.getCurrentUser();
    setState(() {
      _currentUser = user;
      _isLoading = false;
    });
  }

  void _onItemTapped(int index) {
    setState(() => _selectedIndex = index);
    
    switch (index) {
      case 0:
        // Already on Dashboard
        break;
      case 1:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const AttendanceDetailScreen()),
        );
        break;
      case 2:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const ActivitiesScreen()),
        );
        break;
      case 3:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const NotificationsScreen()),
        );
        break;
      case 4:
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const CredentialScreen()),
        );
        break;
    }
  }

  void _logout() async {
    await _authService.logout();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Humbolth',
                          style: Theme.of(context).textTheme.headlineMedium!.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const CredentialScreen()),
                            );
                          },
                          child: CircleAvatar(
                            radius: 24,
                            backgroundColor: AppTheme.cardDark,
                            child: const Icon(Icons.person, color: Colors.white),
                          ),
                        ),
                      ],
                ),
                
                // Welcome message
                Text(
                  _currentUser?.role == 'Teacher' ? 'Hola Profesor,' : 'Bienvenido de nuevo,',
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
                Text(
                  '${_currentUser?.username ?? 'Usuario'}!',
                  style: Theme.of(context).textTheme.headlineLarge!.copyWith(
                    color: AppTheme.accentBlue,
                  ),
                ),
                const SizedBox(height: 32),
                
                // Role badge
                if (_currentUser?.role != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.accentBlue.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.accentBlue.withOpacity(0.5)),
                    ),
                    child: Text(
                      _currentUser!.role,
                      style: const TextStyle(
                        color: AppTheme.accentBlue,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                const SizedBox(height: 24),

                if (_isLoading)
                  const Center(child: CircularProgressIndicator())
                else ...[
                // Menu cards
                MenuCard(
                  icon: Icons.check_circle_outline,
                  title: 'Grades',
                  color: AppTheme.accentBlue,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const GradesScreen()),
                    );
                  },
                ),
                const SizedBox(height: 12),
                MenuCard(
                  icon: Icons.assignment_outlined,
                  title: 'Tareas',
                  color: AppTheme.accentPurple,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ActivitiesScreen()),
                    );
                  },
                ),
                const SizedBox(height: 12),
                MenuCard(
                  icon: Icons.calendar_today_outlined,
                  title: 'Attendance',
                  color: AppTheme.accentBlue,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const AttendanceDetailScreen()),
                    );
                  },
                ),
                const SizedBox(height: 12),
                MenuCard(
                  icon: Icons.message_outlined,
                  title: 'Messages',
                  color: AppTheme.accentBlue,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const NotificationsScreen()),
                    );
                  },
                ),
                const SizedBox(height: 12),
                MenuCard(
                  icon: Icons.warning_amber_outlined,
                  title: 'Reportes',
                  color: AppTheme.accentOrange,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ReportsScreen()),
                    );
                  },
                ),
                // Validar Rol 'Parent' o 'Papa' para mostrar Adeudos
                if (_currentUser?.role == 'Parent' || _currentUser?.role == 'Papa') ...[
                  const SizedBox(height: 12),
                  MenuCard(
                    icon: Icons.attach_money,
                    title: 'Adeudos',
                    color: Colors.redAccent,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const DebtsScreen()),
                      );
                    },
                  ),
                ],
                // Validar Rol 'Admin' para Asistente AI
                if (_currentUser?.role == 'Admin') ...[
                  const SizedBox(height: 12),
                  MenuCard(
                    icon: Icons.auto_awesome,
                    title: 'Asistente AI',
                    color: AppTheme.accentPurple,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const AdminChatScreen()),
                      );
                    },
                  ),
                ],
                const SizedBox(height: 32),
                
                // Upcoming section
                Text(
                  'Upcoming',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.cardDark,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'History Essay',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Due Sep 25',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 48),
                
                // Logout Button
                Center(
                  child: TextButton.icon(
                    onPressed: () async {
                      await _authService.logout();
                      if (mounted) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (context) => const LoginScreen()),
                        );
                      }
                    },
                    icon: const Icon(Icons.logout, color: Colors.redAccent),
                    label: const Text(
                      'Cerrar Sesión',
                      style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: AppTheme.primaryDark,
        selectedItemColor: AppTheme.accentBlue,
        unselectedItemColor: Colors.white38,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
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
}
