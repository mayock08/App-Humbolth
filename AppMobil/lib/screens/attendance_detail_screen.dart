import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AttendanceDetailScreen extends StatefulWidget {
  const AttendanceDetailScreen({super.key});

  @override
  State<AttendanceDetailScreen> createState() => _AttendanceDetailScreenState();
}

class _AttendanceDetailScreenState extends State<AttendanceDetailScreen> {
  int _selectedIndex = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      appBar: AppBar(
        backgroundColor: AppTheme.primaryDark,
        title: const Text('Asistencia'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              // Profile section
              CircleAvatar(
                radius: 60,
                backgroundColor: AppTheme.cardDark,
                child: const Icon(Icons.person, size: 60, color: Colors.white),
              ),
              const SizedBox(height: 16),
              const Text(
                'Juan Pérez',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 24),
              
              // Attendance percentage
              const Text(
                '85%',
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Período',
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.accentCyan,
                ),
              ),
              const Text(
                'Marzo 2024',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 32),
              
              // Stats grid
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.cardDark,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStat('Asistencias', '17'),
                        _buildStat('Retardos', '1'),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStat('Ausencias', '3'),
                        _buildStat('Justificadas', '2'),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              
              // Recent records
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Registros recientes',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 20),
                ),
              ),
              const SizedBox(height: 16),
              
              _buildAttendanceRecord('Miércoles 13 mar.', 'RETARDO', AppTheme.accentYellow),
              _buildAttendanceRecord('Martes 12 mar.', 'JUSTIFICADA', AppTheme.accentOrange),
              _buildAttendanceRecord('Lunes 11 mar.', 'ASISTENCIA', AppTheme.accentCyan),
              _buildAttendanceRecord('Viernes 8 mar.', 'ASISTENCIA', AppTheme.accentCyan),
            ],
          ),
        ),
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

  Widget _buildStat(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: Colors.white70,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildAttendanceRecord(String date, String status, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            date,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.white,
            ),
          ),
          Text(
            status,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
