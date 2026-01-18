'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Bell, Volume2, Moon, Globe, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: true,
    language: 'en',
  });

  const toggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Customize your experience</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-navy-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Notifications</p>
                  <p className="text-sm text-gray-400">Receive training reminders</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('notifications')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.notifications ? 'bg-electric-500' : 'bg-navy-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.notifications ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-navy-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Sound Effects</p>
                  <p className="text-sm text-gray-400">Play sounds during games</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('sound')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.sound ? 'bg-electric-500' : 'bg-navy-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.sound ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-navy-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-400">Use dark theme</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('darkMode')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.darkMode ? 'bg-electric-500' : 'bg-navy-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-navy-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Language</p>
                  <p className="text-sm text-gray-400">Select your preferred language</p>
                </div>
              </div>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="bg-navy-600 text-white px-3 py-1.5 rounded-lg border border-navy-500 focus:outline-none focus:border-electric-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-navy-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-white font-medium">Data Privacy</p>
                  <p className="text-sm text-gray-400">Your data is stored locally on your device</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {session?.user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-error-500/30">
            <CardHeader>
              <CardTitle className="text-error-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">
                These actions are irreversible. Please proceed with caution.
              </p>
              <Button variant="danger">Delete Account</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
