'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Trophy, Flame, Gamepad2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useProgressStore } from '@/lib/stores/progressStore';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { stats, unlockedAchievements } = useProgressStore();

  const user = session?.user;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account information</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-electric-500 to-memory flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    width={80}
                    height={80}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {(user?.name || user?.email || 'U')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white font-medium">{user?.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-medium">{user?.email || 'Not logged in'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-400">Member since</p>
                    <p className="text-white font-medium">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
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
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-navy-700/50 rounded-xl">
                <Gamepad2 className="w-6 h-6 text-electric-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalGamesPlayed}</p>
                <p className="text-sm text-gray-400">Games Played</p>
              </div>
              <div className="text-center p-4 bg-navy-700/50 rounded-xl">
                <Flame className="w-6 h-6 text-warning-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
                <p className="text-sm text-gray-400">Current Streak</p>
              </div>
              <div className="text-center p-4 bg-navy-700/50 rounded-xl">
                <Flame className="w-6 h-6 text-error-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.longestStreak}</p>
                <p className="text-sm text-gray-400">Longest Streak</p>
              </div>
              <div className="text-center p-4 bg-navy-700/50 rounded-xl">
                <Trophy className="w-6 h-6 text-success-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{unlockedAchievements.length}</p>
                <p className="text-sm text-gray-400">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
