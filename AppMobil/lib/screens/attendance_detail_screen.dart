import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/app_theme.dart';
import '../models/attendance_model.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class AttendanceDetailScreen extends StatefulWidget {
  const AttendanceDetailScreen({super.key});

  @override
  State<AttendanceDetailScreen> createState() => _AttendanceDetailScreenState();
}

class _AttendanceDetailScreenState extends State<AttendanceDetailScreen> {
  int _selectedIndex = 1;
  final ApiService _apiService = ApiService();
  final AuthService _authService = AuthService();
  List<Attendance> _attendanceRecords = [];
  User? _currentUser;
  bool _isLoading = true;
  String? _error;

  // Stats
  int _total = 0;
  int _present = 0;
  int _late = 0;
  int _absent = 0;
  int _justified = 0;
  double _percentage = 0.0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        setState(() => _currentUser = user);
        final data = await _apiService.getStudentAttendance(user.userId);
        
        final records = data.map((json) => Attendance.fromJson(json)).toList();
        
        _calculateStats(records);
        
        setState(() {
          _attendanceRecords = records;
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
        _error = 'Error al cargar asistencias: $e';
        _isLoading = false;
      });
    }
  }

  void _calculateStats(List<Attendance> records) {
    int p = 0;
    int l = 0;
    int a = 0;
    int j = 0;

    for (var record in records) {
      switch (record.status.toUpperCase()) {
        case 'P': // Presente
          p++;
          break;
        case 'L': // Retardo
          l++;
          break;
        case 'A': // Ausencia
          a++;
          break;
        case 'J': // Justificado
          j++;
          break;
        default:
          // Assume P if unknown or treat as custom
          if (record.status == 'ASISTENCIA') p++;
          else if (record.status == 'RETARDO') l++;
          else if (record.status == 'FALTA') a++;
          else if (record.status == 'JUSTIFICADA') j++;
          else a++; // Default to absent if totally unknown? Or present? Let's say Absent for safety
          break;
      }
    }

    // Adjust counts based on your backend codes. 
    // Assuming backend returns single chars: P, A, R (Retardo), J (Justificado)
    // Looking at backend controller... it says nothing about codes, just "Status".
    // Attendance model has Status.
    // Let's refine based on "P, A, R" comment in Course.cs line 107: "P, A, R".
    
    // Reset and redo simple check
    p = records.where((r) => r.status == 'P').length;
    a = records.where((r) => r.status == 'A').length;
    l = records.where((r) => r.status == 'R').length;
    j = records.where((r) => r.status == 'J').length;

    int totalClasses = records.length;
    double percentage = totalClasses > 0 
        ? ((p + l + j) / totalClasses) * 100 // Assuming Late and Justified count towards attendance %? Or maybe just P? usually P+L+J
        : 100.0;

    _present = p;
    _late = l;
    _absent = a;
    _justified = j;
    _total = totalClasses;
    _percentage = percentage;
  }

  String _getStatusText(String code) {
    switch (code) {
      case 'P': return 'ASISTENCIA';
      case 'A': return 'FALTA';
      case 'R': return 'RETARDO';
      case 'J': return 'JUSTIFICADA';
      default: return code;
    }
  }

  Color _getStatusColor(String code) {
     switch (code) {
      case 'P': return AppTheme.accentCyan;
      case 'A': return AppTheme.accentRed;
      case 'R': return AppTheme.accentYellow;
      case 'J': return AppTheme.accentOrange;
      default: return Colors.white;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      appBar: AppBar(
        backgroundColor: AppTheme.primaryDark,
        title: const Text('Asistencia'),
        centerTitle: true,
        actions: [
          IconButton(
             icon: const Icon(Icons.refresh, color: Colors.white),
             onPressed: () {
               setState(() { _isLoading = true; _error = null; });
               _loadData();
             },
          )
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _error != null
           ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
           : SingleChildScrollView(
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
                    Text(
                      _currentUser?.username ?? 'Usuario',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    // Attendance percentage
                    Text(
                      '${_percentage.toStringAsFixed(0)}%',
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Asistencia Total',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.accentCyan,
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
                              _buildStat('Asistencias', '$_present'),
                              _buildStat('Retardos', '$_late'),
                            ],
                          ),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildStat('Ausencias', '$_absent'),
                              _buildStat('Justificadas', '$_justified'),
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
                        'Historial de Asistencias',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 20),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    if (_attendanceRecords.isEmpty)
                      const Text('No hay registros de asistencia', style: TextStyle(color: Colors.white60)),

                    ..._attendanceRecords.map((record) {
                        final dateStr = DateFormat('EEEE d MMM', 'es').format(record.classDate); 
                        // Note: 'es' locale needs intl configuration, defaulting to EN if not setup, or plain
                        final dateStrFallback = DateFormat('yyyy-MM-dd').format(record.classDate);
                        
                        return _buildAttendanceRecord(
                          dateStrFallback, 
                          _getStatusText(record.status), 
                          _getStatusColor(record.status)
                        );
                    }).toList(),
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
