import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

final ThemeData kidTheme = ThemeData(
  fontFamily: 'BKoodak',
  brightness: Brightness.light,
  scaffoldBackgroundColor: Colors.pink[50],
  primaryColor: Colors.purple,
  textTheme: TextTheme(
    headlineSmall: TextStyle(
      fontSize: 20,
      fontWeight: FontWeight.bold,
      color: Colors.deepPurple,
      shadows: [
        Shadow(blurRadius: 2, color: Colors.pinkAccent, offset: Offset(1, 1)),
      ],
    ),
    bodyMedium: TextStyle(fontSize: 16, color: Colors.black87),
  ),
);

final ThemeData adultTheme = ThemeData(
  fontFamily: 'Shabnam',
  brightness: Brightness.light,
  scaffoldBackgroundColor: Colors.grey[200],
  primaryColor: Colors.black,
  textTheme: TextTheme(
    headlineSmall: TextStyle(
      fontSize: 20,
      fontWeight: FontWeight.bold,
      color: Colors.grey[700],
      shadows: [
        Shadow(blurRadius: 2, color: Colors.amber, offset: Offset(1, 1)),
      ],
    ),
    bodyMedium: TextStyle(fontSize: 16, color: Colors.black87),
  ),
);

Future<void> setUserTheme(String type) async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  await prefs.setString('user_theme', type);
}

Future<String> getUserTheme() async {
  SharedPreferences prefs = await SharedPreferences.getInstance();
  return prefs.getString('user_theme') ?? 'kid';
}
