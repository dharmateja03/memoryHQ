'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Flame, RotateCcw, Home, ArrowRight, Star } from 'lucide-react';
import { Button, Card, CircularProgress } from '@/components/ui';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface GameResultsProps {
  gameName: string;
  score: number;
  accuracy: number;
  averageReactionTime?: number;
  roundsCompleted: number;
  totalRounds: number;
  bestStreak: number;
  difficulty: number;
  personalBest?: number;
  onPlayAgain: () => void;
  onExit: () => void;
  onNextGame?: () => void;
}

export function GameResults({
  gameName,
  score,
  accuracy,
  averageReactionTime,
  roundsCompleted,
  totalRounds,
  bestStreak,
  difficulty,
  personalBest,
  onPlayAgain,
  onExit,
  onNextGame,
}: GameResultsProps) {
  const isNewRecord = personalBest !== undefined && score > personalBest;
  const performanceRating = getPerformanceRating(accuracy);

  useEffect(() => {
    // Trigger confetti for good performance
    if (accuracy >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'],
      });
    }
  }, [accuracy]);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="text-center overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-electric-500/20 to-memory/20 p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-navy-800 mb-4"
            >
              {performanceRating.icon}
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-1">{performanceRating.label}</h2>
            <p className="text-gray-400">{gameName} - Level {difficulty}</p>

            {isNewRecord && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-warning-500/20 rounded-full"
              >
                <Star className="w-4 h-4 text-warning-400" />
                <span className="text-warning-400 font-medium">New Personal Best!</span>
              </motion.div>
            )}
          </div>

          {/* Stats */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Score */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CircularProgress
                  value={Math.min(score, 1000)}
                  max={1000}
                  size={100}
                  color="#3B82F6"
                  label="Score"
                />
              </motion.div>

              {/* Accuracy */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CircularProgress
                  value={accuracy}
                  max={100}
                  size={100}
                  color={accuracy >= 80 ? '#10B981' : accuracy >= 60 ? '#F59E0B' : '#EF4444'}
                  label="Accuracy"
                />
              </motion.div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {averageReactionTime !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-navy-700/50 rounded-xl p-4"
                >
                  <Zap className="w-5 h-5 text-speed mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">
                    {Math.round(averageReactionTime)}ms
                  </div>
                  <div className="text-xs text-gray-500">Avg. Reaction</div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-navy-700/50 rounded-xl p-4"
              >
                <Target className="w-5 h-5 text-attention mx-auto mb-2" />
                <div className="text-lg font-bold text-white">
                  {roundsCompleted}/{totalRounds}
                </div>
                <div className="text-xs text-gray-500">Rounds</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-navy-700/50 rounded-xl p-4"
              >
                <Flame className="w-5 h-5 text-warning-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{bestStreak}x</div>
                <div className="text-xs text-gray-500">Best Streak</div>
              </motion.div>
            </div>

            {/* Improvement Tips */}
            {accuracy < 80 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-navy-700/30 rounded-xl p-4 mb-8 text-left"
              >
                <h4 className="text-sm font-medium text-white mb-2">Tips for Improvement</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>Take your time to focus before each round</li>
                  <li>Try the practice mode to warm up</li>
                  <li>Consider lowering the difficulty for better accuracy</li>
                </ul>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button
                variant="ghost"
                onClick={onExit}
                icon={<Home className="w-4 h-4" />}
              >
                Exit
              </Button>
              <Button
                variant="secondary"
                onClick={onPlayAgain}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Play Again
              </Button>
              {onNextGame && (
                <Button
                  onClick={onNextGame}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Next Game
                </Button>
              )}
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function getPerformanceRating(accuracy: number): { label: string; icon: React.ReactNode } {
  if (accuracy >= 95) {
    return {
      label: 'Perfect!',
      icon: <Trophy className="w-10 h-10 text-warning-400" />,
    };
  }
  if (accuracy >= 85) {
    return {
      label: 'Excellent!',
      icon: <Star className="w-10 h-10 text-electric-400" />,
    };
  }
  if (accuracy >= 70) {
    return {
      label: 'Good Job!',
      icon: <Target className="w-10 h-10 text-success-400" />,
    };
  }
  if (accuracy >= 50) {
    return {
      label: 'Keep Practicing',
      icon: <Flame className="w-10 h-10 text-warning-500" />,
    };
  }
  return {
    label: 'Try Again',
    icon: <RotateCcw className="w-10 h-10 text-gray-400" />,
  };
}
