'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Zap,
  Puzzle,
  RefreshCw,
  Flame,
  Clock,
  Gamepad2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';
import { RadarChart } from '@/components/ui/RadarChart';
import { DOMAIN_COLORS, DOMAIN_LABELS, type CognitiveDomain } from '@/types';

const domainIcons: Record<CognitiveDomain, React.ElementType> = {
  memory: Brain,
  attention: Target,
  speed: Zap,
  problem_solving: Puzzle,
  flexibility: RefreshCw,
};

// Mock data
const mockProfile = {
  memory: { score: 72, change: 5, difficulty: 4 },
  attention: { score: 65, change: -2, difficulty: 3 },
  speed: { score: 81, change: 8, difficulty: 5 },
  problem_solving: { score: 58, change: 3, difficulty: 3 },
  flexibility: { score: 69, change: 6, difficulty: 4 },
};

const mockWeeklyData = [
  { day: 'Mon', score: 65, games: 3 },
  { day: 'Tue', score: 68, games: 4 },
  { day: 'Wed', score: 70, games: 3 },
  { day: 'Thu', score: 67, games: 2 },
  { day: 'Fri', score: 72, games: 5 },
  { day: 'Sat', score: 75, games: 4 },
  { day: 'Sun', score: 69, games: 3 },
];

const mockRecentGames = [
  { game: 'Memory Matrix', domain: 'memory' as CognitiveDomain, score: 850, accuracy: 85, date: '2h ago' },
  { game: 'Stroop Test', domain: 'attention' as CognitiveDomain, score: 720, accuracy: 78, date: '5h ago' },
  { game: 'Simple Reaction', domain: 'speed' as CognitiveDomain, score: 920, accuracy: 92, date: 'Yesterday' },
  { game: 'Number Series', domain: 'problem_solving' as CognitiveDomain, score: 680, accuracy: 75, date: 'Yesterday' },
  { game: 'Task Switching', domain: 'flexibility' as CognitiveDomain, score: 780, accuracy: 82, date: '2 days ago' },
];

type TimeRange = 'week' | 'month' | 'all';

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const overallScore = Math.round(
    Object.values(mockProfile).reduce((acc, d) => acc + d.score, 0) / 5
  );

  const overallChange = Math.round(
    Object.values(mockProfile).reduce((acc, d) => acc + d.change, 0) / 5
  );

  const radarData = Object.entries(mockProfile).map(([domain, data]) => ({
    domain: domain as CognitiveDomain,
    value: data.score,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Your Progress
          </h1>
          <p className="text-gray-400 mt-1">
            Track your cognitive improvement over time
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2 bg-navy-700 rounded-xl p-1">
          {(['week', 'month', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-electric-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-white">{overallScore}</div>
              <div className="text-sm text-gray-400 mt-1">Brain Score</div>
              <div className={`flex items-center justify-center gap-1 mt-2 text-xs ${
                overallChange >= 0 ? 'text-success-400' : 'text-error-400'
              }`}>
                {overallChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{overallChange >= 0 ? '+' : ''}{overallChange} this {timeRange}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Flame className="w-6 h-6 text-warning-500" />
                <span className="text-3xl font-bold text-white">7</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">Day Streak</div>
              <div className="text-xs text-gray-500 mt-2">Best: 14 days</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Gamepad2 className="w-6 h-6 text-electric-500" />
                <span className="text-3xl font-bold text-white">24</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">Games This Week</div>
              <div className="text-xs text-gray-500 mt-2">Avg: 3.4/day</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-6 h-6 text-memory" />
                <span className="text-3xl font-bold text-white">156</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">Minutes Trained</div>
              <div className="text-xs text-gray-500 mt-2">This week</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cognitive Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <RadarChart data={radarData} size={260} />
                <div className="flex-1 space-y-4 w-full">
                  {Object.entries(mockProfile).map(([domain, data]) => {
                    const Icon = domainIcons[domain as CognitiveDomain];
                    return (
                      <div key={domain} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${DOMAIN_COLORS[domain as CognitiveDomain]}20` }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: DOMAIN_COLORS[domain as CognitiveDomain] }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {DOMAIN_LABELS[domain as CognitiveDomain]}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">{data.score}</span>
                              <span className={`text-xs ${
                                data.change >= 0 ? 'text-success-400' : 'text-error-400'
                              }`}>
                                {data.change >= 0 ? '+' : ''}{data.change}
                              </span>
                            </div>
                          </div>
                          <Progress value={data.score} size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockWeeklyData.map((day, index) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <div className="w-10 text-sm text-gray-400">{day.day}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-navy-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${day.score}%` }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          className="h-full bg-gradient-to-r from-electric-500 to-memory rounded-full"
                        />
                      </div>
                    </div>
                    <div className="w-8 text-sm text-gray-400 text-right">{day.games}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-navy-600 text-xs text-gray-500">
                <span>Score</span>
                <span>Games played</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Games */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-navy-600">
                    <th className="pb-3">Game</th>
                    <th className="pb-3">Domain</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Accuracy</th>
                    <th className="pb-3">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700">
                  {mockRecentGames.map((game, index) => {
                    const Icon = domainIcons[game.domain];
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="text-sm"
                      >
                        <td className="py-3 text-white font-medium">{game.game}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Icon
                              className="w-4 h-4"
                              style={{ color: DOMAIN_COLORS[game.domain] }}
                            />
                            <span style={{ color: DOMAIN_COLORS[game.domain] }}>
                              {DOMAIN_LABELS[game.domain]}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-400">{game.score.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`${
                            game.accuracy >= 85 ? 'text-success-400' :
                            game.accuracy >= 70 ? 'text-warning-400' :
                            'text-error-400'
                          }`}>
                            {game.accuracy}%
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">{game.date}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Achievements</CardTitle>
            <span className="text-sm text-electric-400">View All</span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🔥', name: '7 Day Streak', desc: 'Train for 7 days in a row' },
                { icon: '🎯', name: 'Sharp Shooter', desc: '90%+ accuracy in Speed games' },
                { icon: '🧠', name: 'Memory Master', desc: 'Complete all Memory games' },
                { icon: '⚡', name: 'Speed Demon', desc: 'Sub-200ms reaction time' },
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="bg-navy-700/50 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="text-white font-medium text-sm">{achievement.name}</div>
                  <div className="text-gray-500 text-xs mt-1">{achievement.desc}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
