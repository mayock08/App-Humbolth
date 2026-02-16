class IqTest {
  final int id;
  final String name;
  final String? description;
  final int totalTimeMinutes;
  final List<IqSection> sections;

  IqTest({
    required this.id,
    required this.name,
    this.description,
    required this.totalTimeMinutes,
    required this.sections,
  });

  factory IqTest.fromJson(Map<String, dynamic> json) {
    return IqTest(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      totalTimeMinutes: json['totalTimeMinutes'] ?? 45,
      sections: (json['sections'] as List?)
              ?.map((e) => IqSection.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class IqSection {
  final int id;
  final String name;
  final String? description;
  final List<IqQuestion> questions;

  IqSection({
    required this.id,
    required this.name,
    this.description,
    required this.questions,
  });

  factory IqSection.fromJson(Map<String, dynamic> json) {
    return IqSection(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      questions: (json['questions'] as List?)
              ?.map((e) => IqQuestion.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class IqQuestion {
  final int id;
  final String text;
  final String questionType;
  final int score;
  final String? imageUrl;
  final List<IqOption> options;

  IqQuestion({
    required this.id,
    required this.text,
    required this.questionType,
    required this.score,
    this.imageUrl,
    required this.options,
  });

  factory IqQuestion.fromJson(Map<String, dynamic> json) {
    return IqQuestion(
      id: json['id'],
      text: json['text'],
      questionType: json['questionType'],
      score: json['score'] ?? 1,
      imageUrl: json['imageUrl'],
      options: (json['options'] as List?)
              ?.map((e) => IqOption.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class IqOption {
  final int id;
  final String text;
  final String optionKey;
  final String? imageUrl;

  IqOption({
    required this.id,
    required this.text,
    required this.optionKey,
    this.imageUrl,
  });

  factory IqOption.fromJson(Map<String, dynamic> json) {
    return IqOption(
      id: json['id'],
      text: json['text'],
      optionKey: json['optionKey'],
      imageUrl: json['imageUrl'],
    );
  }
}
