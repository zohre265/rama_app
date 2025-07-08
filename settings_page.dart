import 'package:flutter/material.dart';

class SettingsPage extends StatelessWidget {
  final Function(String) onThemeChanged;
  const SettingsPage({required this.onThemeChanged});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('تنظیمات')),
      body: Column(
        children: [
          ListTile(
            title: Text('ظاهر کودکانه'),
            leading: Radio(
              value: 'kid',
              groupValue: null,
              onChanged: (val) => onThemeChanged('kid'),
            ),
          ),
          ListTile(
            title: Text('ظاهر بزرگسال'),
            leading: Radio(
              value: 'adult',
              groupValue: null,
              onChanged: (val) => onThemeChanged('adult'),
            ),
          ),
        ],
      ),
    );
  }
}
