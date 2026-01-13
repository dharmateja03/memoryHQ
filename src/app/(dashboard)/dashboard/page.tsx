'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  TrendingUp,
  Target,
  Flame,
  ChevronRight,
  Brain,
  Zap,
  Puzzle,
  RefreshCw,
  Award
} from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Progress } from '@/components/ui';
import { RadarChart } from '@/components/ui/RadarChart';
import { DOMAIN_COLORS, DOMAIN_LABELS, type CognitiveDomain } from '@/types';
import { useProgressStore, getAchievements, getAchievementById } from '@/lib/stores/progressStore';

const domainIcons: Record<CognitiveDomain, React.ElementType> = {
  memory: Brain,
  attention: Target,
  speed: Zap,
  problem_solving: Puzzle,
  flexibility: RefreshCw,
};

export default function DashboardPage() {
  const {
    stats,
    todayGames,
    unlockedAchievements,
    gameResults,
    generateTodayGames,
    getOverallScore,
  } = useProgressStore();

  // Generate today's games on mount
  useEffect(() => {
    generateTodayGames();
  }, [generateTodayGames]);

  const overallScore = getOverallScore();

  const radarData = [
    { domain: 'memory' as CognitiveDomain, value: stats.domainScores.memory },
    { domain: 'attention' as CognitiveDomain, value: stats.domainScores.attention },
    { domain: 'speed' as CognitiveDomain, value: stats.domainScores.speed },
    { domain: 'problem_solving' as CognitiveDomain, value: stats.domainScores.problem_solving },
    { domain: 'flexibility' as CognitiveDomain, value: stats.domainScores.flexibility },
  ];

  // Get recent activity (last 5 games)
  const recentActivity = gameResults.slice(0, 5).map(result => ({
    game: result.gameName,
    score: result.score,
    accuracy: result.accuracy,
    date: formatRelativeTime(result.completedAt),
  }));

  // Get recently unlocked achievements (last 3)
  const recentAchievements = unlockedAchievements
    .slice(-3)
    .reverse()
    .map(ua => getAchievementById(ua.achievementId))
    .filter(Boolean);

  const completedTodayCount = todayGames.filter(g => g.completed).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back!
          </h1>
          <p className="text-gray-400 mt-1">
            {stats.totalGamesPlayed === 0
              ? 'Ready to start your brain training journey?'
              : 'Ready to train your brain today?'}
          </p>
        </div>
        <Link href="/training">
          <Button size="lg" icon={<Play className="w-5 h-5" />}>
            Start Training
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <CardContent>
              <div className="text-3xl font-bold text-white">{overallScore}</div>
              <div className="text-sm text-gray-400 mt-1">Brain Score</div>
              {stats.totalGamesPlayed > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2 text-success-400 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>Keep training!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <CardContent>
              <div className="flex items-center justify-center gap-2">
                <Flame className={`w-6 h-6 ${stats.currentStreak > 0 ? 'text-warning-500' : 'text-gray-600'}`} />
                <span className="text-3xl font-bold text-white">{stats.currentStreak}</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">Day Streak</div>
              <div className="text-xs text-gray-500 mt-2">
                Best: {stats.longestStreak}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalGamesPlayed}</div>
              <div className="text-sm text-gray-400 mt-1">Games Played</div>
              <div className="text-xs text-gray-500 mt-2">
                Today: {stats.gamesPlayedToday}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <CardContent>
              <div className="flex items-center justify-center gap-2">
                <Award className={`w-6 h-6 ${unlockedAchievements.length > 0 ? 'text-electric-500' : 'text-gray-600'}`} />
                <span className="text-3xl font-bold text-white">{unlockedAchievements.length}</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">Achievements</div>
              <div className="text-xs text-gray-500 mt-2">
                {getAchievements().length - unlockedAchievements.length} remaining
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
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
              <CardTitle>Your Cognitive Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <RadarChart data={radarData} size={280} />
                <div className="flex-1 space-y-4 w-full">
                  {radarData.map((item) => {
                    const Icon = domainIcons[item.domain];
                    return (
                      <div key={item.domain} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${DOMAIN_COLORS[item.domain]}20` }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: DOMAIN_COLORS[item.domain] }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {DOMAIN_LABELS[item.domain]}
                            </span>
                            <span className="text-sm text-gray-400">{item.value}</span>
                          </div>
                          <Progress
                            value={item.value}
                            color={`bg-[${DOMAIN_COLORS[item.domain]}]`}
                            size="sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Training */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today&apos;s Training</CardTitle>
              <span className="text-sm text-gray-400">
                {completedTodayCount}/{todayGames.length} complete
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayGames.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Loading today&apos;s games...
                  </p>
                ) : (
                  todayGames.map((game, index) => {
                    const Icon = domainIcons[game.domain];
                    return (
                      <Link
                        key={game.id}
                        href={`/games/${game.gameId}`}
                        className="block"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            game.completed
                              ? 'bg-success-500/10 border-success-500/30'
                              : 'bg-navy-700/50 border-navy-600 hover:border-electric-500/50'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${DOMAIN_COLORS[game.domain]}20` }}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{ color: DOMAIN_COLORS[game.domain] }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">
                                {game.name}
                              </span>
                              {game.completed && (
                                <span className="text-xs text-success-400">Done</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              Level {game.difficulty}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </motion.div>
                      </Link>
                    );
                  })
                )}
              </div>
              <Link href="/training" className="block mt-4">
                <Button variant="secondary" className="w-full">
                  View Full Training Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements Row */}
      {unlockedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Achievements</CardTitle>
              <span className="text-sm text-gray-400">
                {unlockedAchievements.length}/{getAchievements().length} unlocked
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement?.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-electric-500/10 border border-electric-500/30 rounded-xl"
                  >
                    <span className="text-2xl">{achievement?.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">{achievement?.name}</div>
                      <div className="text-xs text-gray-400">{achievement?.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/progress" className="text-sm text-electric-400 hover:text-electric-300">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No games played yet.</p>
                <p className="text-gray-600 text-sm mt-2">
                  Complete a game to see your activity here!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="pb-3">Game</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Accuracy</th>
                      <th className="pb-3">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-700">
                    {recentActivity.map((activity, index) => (
                      <tr key={index} className="text-sm">
                        <td className="py-3 text-white font-medium">{activity.game}</td>
                        <td className="py-3 text-gray-400">{activity.score.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`${
                            activity.accuracy >= 90 ? 'text-success-400' :
                            activity.accuracy >= 70 ? 'text-warning-400' :
                            'text-error-400'
                          }`}>
                            {activity.accuracy}%
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">{activity.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
