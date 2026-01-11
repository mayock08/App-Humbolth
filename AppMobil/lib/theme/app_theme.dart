import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primaryDark = Color(0xFF0A1628);
  static const Color cardDark = Color(0xFF1A2942);
  static const Color accentBlue = Color(0xFF4A9EFF);
  static const Color accentCyan = Color(0xFF00D9FF);
  static const Color accentOrange = Color(0xFFFF8A4C);
  static const Color accentRed = Color(0xFFFF5C5C);
  static const Color accentGreen = Color(0xFF4CAF50);
  static const Color accentYellow = Color(0xFFFFB84C);
  static const Color accentPurple = Color(0xFF9C4CFF);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: primaryDark,
      scaffoldBackgroundColor: primaryDark,
      cardColor: cardDark,
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        headlineLarge: const TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        headlineMedium: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        bodyLarge: const TextStyle(
          fontSize: 16,
          color: Colors.white,
        ),
        bodyMedium: const TextStyle(
          fontSize: 14,
          color: Colors.white70,
        ),
      ),
      appBarTheme: const AppBarTheme(
        color: primaryDark,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.white),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentBlue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        hintStyle: const TextStyle(color: Colors.white38),
      ),
    );
  }
}
