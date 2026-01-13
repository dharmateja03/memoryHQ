'use client';

import { motion } from 'framer-motion';
import { Play, GraduationCap, Info } from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface GameInstructionsProps {
  title: string;
  description: string;
  instructions: string;
  difficulty: number;
  onStart: () => void;
  onPractice?: () => void;
}

export function GameInstructions({
  title,
  description,
  instructions,
  difficulty,
  onStart,
  onPractice,
}: GameInstructionsProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="text-center">
          <div className="p-8">
            {/* Title */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              <p className="text-gray-400">{description}</p>
            </motion.div>

            {/* Difficulty Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-electric-500/10 rounded-full text-electric-400 text-sm font-medium mb-8"
            >
              <span>Level {difficulty}</span>
              <span className="text-gray-500">|</span>
              <span>{getDifficultyLabel(difficulty)}</span>
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-navy-700/50 rounded-xl p-6 mb-8 text-left"
            >
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-electric-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">How to Play</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{instructions}</p>
                </div>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              <div className="bg-navy-700/30 rounded-lg p-3">
                <div className="text-lg font-bold text-white">Focus</div>
                <div className="text-xs text-gray-500">Stay concentrated</div>
              </div>
              <div className="bg-navy-700/30 rounded-lg p-3">
                <div className="text-lg font-bold text-white">Speed</div>
                <div className="text-xs text-gray-500">React quickly</div>
              </div>
              <div className="bg-navy-700/30 rounded-lg p-3">
                <div className="text-lg font-bold text-white">Accuracy</div>
                <div className="text-xs text-gray-500">Be precise</div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {onPractice && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onPractice}
                  icon={<GraduationCap className="w-5 h-5" />}
                >
                  Practice First
                </Button>
              )}
              <Button
                size="lg"
                onClick={onStart}
                icon={<Play className="w-5 h-5" />}
              >
                Start Game
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function getDifficultyLabel(level: number): string {
  if (level <= 2) return 'Beginner';
  if (level <= 4) return 'Easy';
  if (level <= 6) return 'Medium';
  if (level <= 8) return 'Hard';
  return 'Expert';
}
