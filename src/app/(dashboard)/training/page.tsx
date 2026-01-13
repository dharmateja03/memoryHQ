'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  CheckCircle2,
  Circle,
  ChevronRight,
  Brain,
  Target,
  Zap,
  Puzzle,
  RefreshCw,
  Flame,
  Clock,
  Trophy
} from 'lucide-react';
import { Button, Card, CardContent, Progress } from '@/components/ui';
import { DOMAIN_COLORS, DOMAIN_LABELS, type CognitiveDomain } from '@/types';

const domainIcons: Record<CognitiveDomain, React.ElementType> = {
  memory: Brain,
  attention: Target,
  speed: Zap,
  problem_solving: Puzzle,
  flexibility: RefreshCw,
};

// Mock daily training plan
const mockDailyPlan = {
  date: new Date(),
  games: [
    { id: 'memory-matrix', name: 'Memory Matrix', domain: 'memory' as CognitiveDomain, difficulty: 4, completed: true, score: 850 },
    { id: 'stroop-test', name: 'Stroop Test', domain: 'attention' as CognitiveDomain, difficulty: 3, completed: true, score: 720 },
    { id: 'simple-reaction', name: 'Simple Reaction', domain: 'speed' as CognitiveDomain, difficulty: 5, completed: false },
    { id: 'number-series', name: 'Number Series', domain: 'problem_solving' as CognitiveDomain, difficulty: 4, completed: false },
    { id: 'task-switching', name: 'Task Switching', domain: 'flexibility' as CognitiveDomain, difficulty: 3, completed: false },
  ],
  estimatedMinutes: 15,
  focusDomain: 'speed' as CognitiveDomain,
};

export default function TrainingPage() {
  const completedGames = mockDailyPlan.games.filter(g => g.completed).length;
  const totalGames = mockDailyPlan.games.length;
  const progress = (completedGames / totalGames) * 100;

  // Find next game to play
  const nextGame = mockDailyPlan.games.find(g => !g.completed);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Today&apos;s Training
        </h1>
        <p className="text-gray-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="mb-8 bg-gradient-to-r from-electric-500/10 to-memory/10 border-electric-500/20">
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold text-white">
                    {completedGames}/{totalGames}
                  </div>
                  <div className="text-gray-400">
                    games completed
                  </div>
                </div>
                <Progress value={progress} size="lg" color="bg-electric-500" />
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-warning-400">
                    <Flame className="w-5 h-5" />
                    <span className="text-2xl font-bold">7</span>
                  </div>
                  <div className="text-xs text-gray-500">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-gray-300">
                    <Clock className="w-5 h-5" />
                    <span className="text-2xl font-bold">{mockDailyPlan.estimatedMinutes}</span>
                  </div>
                  <div className="text-xs text-gray-500">Minutes Left</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Focus Domain */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border-navy-600">
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${DOMAIN_COLORS[mockDailyPlan.focusDomain]}20` }}
              >
                {(() => {
                  const Icon = domainIcons[mockDailyPlan.focusDomain];
                  return <Icon className="w-6 h-6" style={{ color: DOMAIN_COLORS[mockDailyPlan.focusDomain] }} />;
                })()}
              </div>
              <div>
                <div className="text-sm text-gray-400">Today&apos;s Focus</div>
                <div className="text-lg font-semibold text-white">
                  {DOMAIN_LABELS[mockDailyPlan.focusDomain]}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm text-gray-400">Your weakest area</div>
                <div className="text-sm text-electric-400">Extra practice added</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Start Next Game Button */}
      {nextGame && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Link href={`/games/${nextGame.id}`}>
            <Card
              hoverable
              className="bg-gradient-to-r from-electric-500 to-electric-400 border-0 cursor-pointer"
            >
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <Play className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-white/80 text-sm">Up Next</div>
                      <div className="text-xl font-bold text-white">{nextGame.name}</div>
                      <div className="text-white/60 text-sm">Level {nextGame.difficulty}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Games List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white mb-4">Training Plan</h2>
        {mockDailyPlan.games.map((game, index) => {
          const Icon = domainIcons[game.domain];
          const isNext = game.id === nextGame?.id;

          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Link href={`/games/${game.id}`}>
                <Card
                  hoverable={!game.completed}
                  className={`border transition-all ${
                    game.completed
                      ? 'bg-success-500/5 border-success-500/30'
                      : isNext
                      ? 'bg-electric-500/5 border-electric-500/30'
                      : 'border-navy-600 hover:border-electric-500/50'
                  }`}
                >
                  <CardContent>
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {game.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-success-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-navy-500" />
                        )}
                      </div>

                      {/* Game Icon */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${DOMAIN_COLORS[game.domain]}15` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: DOMAIN_COLORS[game.domain] }}
                        />
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${game.completed ? 'text-gray-400' : 'text-white'}`}>
                            {game.name}
                          </span>
                          {isNext && (
                            <span className="px-2 py-0.5 bg-electric-500/20 text-electric-400 text-xs rounded-full">
                              Next
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500">Level {game.difficulty}</span>
                          <span className="text-gray-600">|</span>
                          <span style={{ color: DOMAIN_COLORS[game.domain] }}>
                            {DOMAIN_LABELS[game.domain]}
                          </span>
                        </div>
                      </div>

                      {/* Score or Play */}
                      <div className="flex-shrink-0">
                        {game.completed && game.score ? (
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{game.score}</div>
                            <div className="text-xs text-gray-500">points</div>
                          </div>
                        ) : (
                          <Button size="sm" variant={isNext ? 'primary' : 'ghost'}>
                            Play
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedGames === totalGames && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-success-500/10 to-success-400/10 border-success-500/30 text-center">
            <CardContent>
              <Trophy className="w-12 h-12 text-success-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Training Complete!
              </h3>
              <p className="text-gray-400 mb-4">
                Great work! You&apos;ve completed all of today&apos;s training games.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/games">
                  <Button variant="secondary">Play More Games</Button>
                </Link>
                <Link href="/progress">
                  <Button>View Progress</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
