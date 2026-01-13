'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface WordRecallProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { wordCount: 4, displayTime: 3000, distractorCount: 4 },
  2: { wordCount: 5, displayTime: 3000, distractorCount: 5 },
  3: { wordCount: 6, displayTime: 2500, distractorCount: 6 },
  4: { wordCount: 7, displayTime: 2500, distractorCount: 7 },
  5: { wordCount: 8, displayTime: 2000, distractorCount: 8 },
  6: { wordCount: 9, displayTime: 2000, distractorCount: 9 },
  7: { wordCount: 10, displayTime: 1800, distractorCount: 10 },
  8: { wordCount: 11, displayTime: 1500, distractorCount: 11 },
  9: { wordCount: 12, displayTime: 1500, distractorCount: 12 },
  10: { wordCount: 14, displayTime: 1200, distractorCount: 14 },
};

const WORDS = [
  'apple', 'river', 'mountain', 'garden', 'cloud', 'forest', 'ocean', 'desert',
  'bridge', 'castle', 'flower', 'sunset', 'thunder', 'crystal', 'shadow', 'meadow',
  'harbor', 'valley', 'island', 'canyon', 'glacier', 'volcano', 'prairie', 'lagoon',
  'temple', 'palace', 'village', 'market', 'library', 'museum', 'theater', 'stadium',
  'window', 'mirror', 'candle', 'lantern', 'feather', 'diamond', 'silver', 'golden',
  'dragon', 'phoenix', 'unicorn', 'griffin', 'mermaid', 'wizard', 'knight', 'prince'
];

const gameConfig = {
  id: 'word-recall',
  name: 'Word Recall',
  description: 'Memorize words and identify them among distractors.',
  instructions: 'Study the words shown, then select ALL the words you remember from the options. Avoid selecting words that were not in the original list!',
  domain: 'memory',
};

export function WordRecall({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: WordRecallProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 5;

  const {
    state: gameState,
    showInstructions,
    startCountdown,
    startGame,
    pauseGame,
    resumeGame,
    completeGame,
    nextRound,
    recordResponse,
    resetGame,
    setDifficulty,
  } = useGameState(totalRounds, difficulty);

  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'study' | 'recall' | 'feedback'>('study');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateRound = useCallback(() => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, config.wordCount);
    const distractors = shuffled.slice(config.wordCount, config.wordCount + config.distractorCount);
    const options = [...targets, ...distractors].sort(() => Math.random() - 0.5);

    setTargetWords(targets);
    setAllOptions(options);
    setSelectedWords(new Set());
    setCurrentWordIndex(0);
    setPhase('study');
  }, [config.wordCount, config.distractorCount]);

  // Show words one by one
  useEffect(() => {
    if (phase === 'study' && currentWordIndex < targetWords.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(currentWordIndex + 1);
      }, config.displayTime);
      return () => clearTimeout(timer);
    } else if (phase === 'study' && currentWordIndex >= targetWords.length && targetWords.length > 0) {
      setPhase('recall');
    }
  }, [phase, currentWordIndex, targetWords.length, config.displayTime]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && targetWords.length === 0) {
      generateRound();
    }
  }, [gameState.status, gameState.currentRound, targetWords.length, generateRound]);

  const toggleWord = (word: string) => {
    if (phase !== 'recall') return;
    const newSelected = new Set(selectedWords);
    if (newSelected.has(word)) {
      newSelected.delete(word);
    } else {
      newSelected.add(word);
    }
    setSelectedWords(newSelected);
  };

  const handleSubmit = () => {
    if (phase !== 'recall') return;
    setPhase('feedback');

    // Calculate score
    const targetSet = new Set(targetWords);
    let correct = 0;
    let incorrect = 0;

    selectedWords.forEach(word => {
      if (targetSet.has(word)) correct++;
      else incorrect++;
    });

    const accuracy = Math.max(0, (correct - incorrect) / targetWords.length);
    const isCorrect = accuracy >= 0.7;
    recordResponse(isCorrect, 0);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setTargetWords([]);
      }
    }, 3000);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generateRound();
  };
  const handleRestart = () => {
    resetGame();
    setTargetWords([]);
    setAllOptions([]);
    setSelectedWords(new Set());
    setPhase('study');
    showInstructions();
  };

  const getWordStatus = (word: string) => {
    if (phase !== 'feedback') return null;
    const isTarget = targetWords.includes(word);
    const isSelected = selectedWords.has(word);

    if (isTarget && isSelected) return 'correct';
    if (isTarget && !isSelected) return 'missed';
    if (!isTarget && isSelected) return 'incorrect';
    return 'neutral';
  };

  return (
    <GameWrapper
      gameState={gameState}
      gameConfig={gameConfig}
      onStart={handleStart}
      onPause={pauseGame}
      onResume={resumeGame}
      onRestart={handleRestart}
      onExit={() => onExit?.()}
      onCountdownComplete={handleCountdownComplete}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        {/* Phase Indicator */}
        <div className="mb-6">
          <span className={cn(
            'px-4 py-2 rounded-xl text-sm font-bold',
            phase === 'study' && 'bg-memory/20 text-memory',
            phase === 'recall' && 'bg-electric-500/20 text-electric-400',
            phase === 'feedback' && 'bg-success-500/20 text-success-400'
          )}>
            {phase === 'study' && `Memorize (${currentWordIndex + 1}/${targetWords.length})`}
            {phase === 'recall' && 'Select the words you saw'}
            {phase === 'feedback' && 'Results'}
          </span>
        </div>

        {/* Study Phase */}
        {phase === 'study' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWordIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-64 h-32 bg-navy-700 rounded-2xl flex items-center justify-center border-2 border-memory"
            >
              <span className="text-3xl font-bold text-white capitalize">
                {targetWords[currentWordIndex]}
              </span>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Recall Phase */}
        {(phase === 'recall' || phase === 'feedback') && (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8 max-w-2xl">
              {allOptions.map((word) => {
                const status = getWordStatus(word);
                const isSelected = selectedWords.has(word);

                return (
                  <motion.button
                    key={word}
                    onClick={() => toggleWord(word)}
                    disabled={phase === 'feedback'}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'px-4 py-3 rounded-xl text-sm font-medium transition-all capitalize',
                      'border-2',
                      phase === 'recall' && isSelected && 'bg-electric-500/20 border-electric-500 text-electric-400',
                      phase === 'recall' && !isSelected && 'bg-navy-700 border-navy-600 text-white hover:border-electric-500/50',
                      status === 'correct' && 'bg-success-500/20 border-success-500 text-success-400',
                      status === 'incorrect' && 'bg-error-500/20 border-error-500 text-error-400',
                      status === 'missed' && 'bg-warning-500/20 border-warning-500 text-warning-400',
                      status === 'neutral' && 'bg-navy-700 border-navy-600 text-gray-500'
                    )}
                    whileHover={phase === 'recall' ? { scale: 1.02 } : undefined}
                    whileTap={phase === 'recall' ? { scale: 0.98 } : undefined}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </div>

            {phase === 'recall' && (
              <motion.button
                onClick={handleSubmit}
                className="px-8 py-3 bg-electric-500 text-white rounded-xl font-bold hover:bg-electric-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit ({selectedWords.size} selected)
              </motion.button>
            )}

            {phase === 'feedback' && (
              <div className="text-center">
                <div className="flex gap-6 justify-center text-sm">
                  <div>
                    <span className="text-success-400 font-bold">
                      {Array.from(selectedWords).filter(w => targetWords.includes(w)).length}
                    </span>
                    <span className="text-gray-500"> correct</span>
                  </div>
                  <div>
                    <span className="text-error-400 font-bold">
                      {Array.from(selectedWords).filter(w => !targetWords.includes(w)).length}
                    </span>
                    <span className="text-gray-500"> wrong</span>
                  </div>
                  <div>
                    <span className="text-warning-400 font-bold">
                      {targetWords.filter(w => !selectedWords.has(w)).length}
                    </span>
                    <span className="text-gray-500"> missed</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </GameWrapper>
  );
}
