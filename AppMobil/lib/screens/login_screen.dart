import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';
import '../services/biometric_service.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  final _biometricService = BiometricService();
  
  bool _isLoading = false;
  bool _biometricAvailable = false;
  bool _biometricEnabled = false;
  String _biometricType = '';
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _checkBiometricAvailability();
    _checkExistingSession();
  }

  Future<void> _checkBiometricAvailability() async {
    final available = await _biometricService.isBiometricAvailable();
    final enabled = await _biometricService.isBiometricEnabled();
    
    if (available) {
      final types = await _biometricService.getAvailableBiometrics();
      final typeName = _biometricService.getBiometricTypeName(types);
      
      setState(() {
        _biometricAvailable = available;
        _biometricEnabled = enabled;
        _biometricType = typeName;
      });
    }
  }

  Future<void> _checkExistingSession() async {
    final isAuth = await _authService.isAuthenticated();
    if (isAuth && mounted) {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        _navigateToDashboard();
      }
    }
  }

  Future<void> _handleLogin() async {
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      setState(() {
        _errorMessage = 'Por favor ingresa email y contraseña';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = await _authService.login(
        _emailController.text,
        _passwordController.text,
      );

      if (mounted) {
        // Check if should enable biometrics
        if (_biometricAvailable && !_biometricEnabled) {
          _showBiometricEnableDialog();
        } else {
          _navigateToDashboard();
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleBiometricLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authenticated = await _biometricService.authenticate(
        reason: 'Autentícate para acceder a tu cuenta',
      );

      if (authenticated && mounted) {
        _navigateToDashboard();
      } else {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Autenticación cancelada';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error en autenticación biométrica';
          _isLoading = false;
        });
      }
    }
  }

  void _showBiometricEnableDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Habilitar $_biometricType'),
        content: Text(
          '¿Deseas usar $_biometricType para iniciar sesión más rápido en el futuro?',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _navigateToDashboard();
            },
            child: const Text('Ahora no'),
          ),
          ElevatedButton(
            onPressed: () async {
              await _biometricService.enableBiometric();
              if (mounted) {
                Navigator.pop(context);
                _navigateToDashboard();
              }
            },
            child: const Text('Habilitar'),
          ),
        ],
      ),
    );
  }

  void _navigateToDashboard() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const DashboardScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppTheme.accentBlue,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Center(
                  child: Text(
                    'EDU',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 48),
              
              // Title
              Text(
                'Bienvenido',
                style: Theme.of(context).textTheme.headlineLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Inicia sesión para continuar',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              
              // Error message
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.withOpacity(0.3)),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ),
              
              // Email field
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  hintText: 'Email',
                  prefixIcon: Icon(Icons.email_outlined, color: Colors.white38),
                ),
                keyboardType: TextInputType.emailAddress,
                enabled: !_isLoading,
              ),
              const SizedBox(height: 16),
              
              // Password field
              TextField(
                controller: _passwordController,
                decoration: const InputDecoration(
                  hintText: 'Contraseña',
                  prefixIcon: Icon(Icons.lock_outline, color: Colors.white38),
                ),
                obscureText: true,
                enabled: !_isLoading,
                onSubmitted: (_) => _handleLogin(),
              ),
              const SizedBox(height: 32),
              
              // Login button
              ElevatedButton(
                onPressed: _isLoading ? null : _handleLogin,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'Iniciar Sesión',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
              
              // Biometric login button
              if (_biometricAvailable && _biometricEnabled)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: OutlinedButton.icon(
                    onPressed: _isLoading ? null : _handleBiometricLogin,
                    icon: Icon(
                      _biometricType == 'Face ID' 
                          ? Icons.face 
                          : Icons.fingerprint,
                      color: AppTheme.accentBlue,
                    ),
                    label: Text(
                      'Usar $_biometricType',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.accentBlue,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: const BorderSide(color: AppTheme.accentBlue),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
