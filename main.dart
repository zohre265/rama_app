import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'theme_data.dart';
import 'settings_page.dart';
import 'home_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  String themeType = await getUserTheme();
  runApp(MyApp(themeType: themeType));
}

class MyApp extends StatefulWidget {
  final String themeType;
  const MyApp({required this.themeType});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late ThemeData currentTheme;

  @override
  void initState() {
    super.initState();
    currentTheme = widget.themeType == 'adult' ? adultTheme : kidTheme;
  }

  void updateTheme(String newType) {
    setUserTheme(newType);
    setState(() {
      currentTheme = newType == 'adult' ? adultTheme : kidTheme;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rama',
      theme: currentTheme,
      home: HomePage(onThemeChanged: updateTheme),
    );
  }
}
