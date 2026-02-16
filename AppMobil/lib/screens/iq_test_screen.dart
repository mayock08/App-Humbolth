import 'package:flutter/material.dart';
import '../models/iq_test_model.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class IqTestScreen extends StatefulWidget {
  final IqTest test;

  const IqTestScreen({super.key, required this.test});

  @override
  State<IqTestScreen> createState() => _IqTestScreenState();
}

class _IqTestScreenState extends State<IqTestScreen> {
  final ApiService _apiService = ApiService();
  final AuthService _authService = AuthService();
  
  // Page controller to navigate through questions
  final PageController _pageController = PageController();
  
  // State to track answers: Map<QuestionId, SelectedOptionId>
  final Map<int, int> _answers = {};
  
  int _currentQuestionIndex = 0;
  List<IqQuestion> _allQuestions = [];
  bool _isSubmitting = false;
  DateTime? _startedAt;

  @override
  void initState() {
    super.initState();
    _startedAt = DateTime.now();
    _flattenQuestions();
  }

  void _flattenQuestions() {
    // Flatten sections into a single list of questions for pagination
    for (var section in widget.test.sections) {
      _allQuestions.addAll(section.questions);
    }
  }

  void _selectAnswer(int questionId, int optionId) {
    setState(() {
      _answers[questionId] = optionId;
    });
  }

  Future<void> _submitTest() async {
    // Validate if all questions needed are answered? 
    // Requirement implies "Must complete". Let's check.
    if (_answers.length < _allQuestions.length) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor responde todas las preguntas antes de finalizar.')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final user = await _authService.getCurrentUser();
      if (user == null) throw Exception('Usuario no identificado');

      final attemptData = {
        'studentId': int.parse(user.userId), // Ensure userId is parseable to int/long
        'testId': widget.test.id,
        'startedAt': _startedAt?.toIso8601String(),
        'answers': _answers.entries.map((e) => {
          'questionId': e.key,
          'selectedOptionId': e.value,
        }).toList(),
      };

      await _apiService.submitIqTest(attemptData);

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            title: const Text('¡Test Completado!'),
            content: const Text('Tus respuestas han sido enviadas. Tu puntaje será actualizado en tu perfil.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop(); // Close dialog
                  Navigator.of(context).pop(); // Close screen
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al enviar el test: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryDark,
      appBar: AppBar(
        title: Text(widget.test.name),
        backgroundColor: AppTheme.primaryDark,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4.0),
          child: LinearProgressIndicator(
            value: (_currentQuestionIndex + 1) / _allQuestions.length,
            backgroundColor: Colors.white24,
            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.accentBlue),
          ),
        ),
      ),
      body: PageView.builder(
        controller: _pageController,
        physics: const NeverScrollableScrollPhysics(), // Disable swipe to enforce flow
        itemCount: _allQuestions.length,
        itemBuilder: (context, index) {
          final question = _allQuestions[index];
          return _buildQuestionCard(question, index);
        },
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        color: AppTheme.cardDark,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            if (_currentQuestionIndex > 0)
              TextButton(
                onPressed: () {
                  _pageController.previousPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                  setState(() {
                    _currentQuestionIndex--;
                  });
                },
                child: const Text('Anter.),', style: TextStyle(color: Colors.white70)),
              )
            else
              const SizedBox.shrink(),

            if (_currentQuestionIndex < _allQuestions.length - 1)
              ElevatedButton(
                onPressed: () {
                  _pageController.nextPage(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                  setState(() {
                    _currentQuestionIndex++;
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentBlue,
                ),
                child: const Text('Siguiente'),
              )
            else
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitTest,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                ),
                child: _isSubmitting 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                  : const Text('Finalizar'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestionCard(IqQuestion question, int index) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Pregunta ${index + 1} de ${_allQuestions.length}',
            style: const TextStyle(color: Colors.white54, fontSize: 14),
          ),
          const SizedBox(height: 10),
          Text(
            question.text,
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          if (question.imageUrl != null && question.imageUrl!.isNotEmpty) ...[
            const SizedBox(height: 20),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                question.imageUrl!,
                fit: BoxFit.cover,
                errorBuilder: (ctx, err, stack) => Container(
                  height: 200,
                  color: Colors.grey[800],
                  child: const Center(child: Icon(Icons.broken_image, color: Colors.white54)),
                ),
              ),
            ),
          ],
          const SizedBox(height: 30),
          ...question.options.map((option) => _buildOptionTile(question, option)),
        ],
      ),
    );
  }

  Widget _buildOptionTile(IqQuestion question, IqOption option) {
    final isSelected = _answers[question.id] == option.id;
    
    return GestureDetector(
      onTap: () => _selectAnswer(question.id, option.id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.accentBlue.withOpacity(0.2) : AppTheme.cardDark,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.accentBlue : Colors.white12,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            if (option.imageUrl != null && option.imageUrl!.isNotEmpty)
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  option.imageUrl!,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                ),
              ),
            if (option.imageUrl != null) const SizedBox(width: 16),
            Expanded(
              child: Text(
                option.text,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.white70,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: AppTheme.accentBlue),
          ],
        ),
      ),
    );
  }
}
