import 'package:flutter/material.dart';
import 'settings_page.dart';

class HomePage extends StatelessWidget {
  final Function(String) onThemeChanged;
  const HomePage({required this.onThemeChanged});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('راما')),
      body: Center(child: Text('به راما خوش آمدید')),
      drawer: Drawer(
        child: ListView(
          children: [
            DrawerHeader(child: Text('منو')),
            ListTile(
              title: Text('تنظیمات'),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => SettingsPage(onThemeChanged: onThemeChanged),
                  ),
                );
              },
            )
          ],
        ),
      ),
    );
  }
}
