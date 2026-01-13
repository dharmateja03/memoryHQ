'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface WisconsinCardProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { runsBeforeSwitch: 6, rules: 2 },
  2: { runsBeforeSwitch: 5, rules: 2 },
  3: { runsBeforeSwitch: 5, rules: 3 },
  4: { runsBeforeSwitch: 4, rules: 3 },
  5: { runsBeforeSwitch: 4, rules: 3 },
  6: { runsBeforeSwitch: 3, rules: 3 },
  7: { runsBeforeSwitch: 3, rules: 3 },
  8: { runsBeforeSwitch: 3, rules: 3 },
  9: { runsBeforeSwitch: 2, rules: 3 },
  10: { runsBeforeSwitch: 2, rules: 3 },
};

type Rule = 'color' | 'shape' | 'number';

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B'];
const SHAPES = ['●', '■', '▲', '★'];
const NUMBERS = [1, 2, 3, 4];

interface Card {
  color: string;
  shape: string;
  number: number;
}

const gameConfig = {
  id: 'wisconsin-card',
  name: 'Wisconsin Card Sort',
  description: 'Discover and adapt to changing sorting rules.',
  instructions: 'Match cards based on a hidden rule (color, shape, or number). Use feedback to discover the rule. The rule changes without warning!',
  domain: 'flexibility',
};

export function WisconsinCard({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: WisconsinCardProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 40;
  const allRules: Rule[] = ['color', 'shape', 'number'];
  const rules = allRules.slice(0, config.rules);

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

  const [targetCards, setTargetCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [currentRule, setCurrentRule] = useState<Rule>('color');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const initializeGame = useCallback(() => {
    // Create 4 distinct target cards
    const targets: Card[] = [
      { color: COLORS[0], shape: SHAPES[0], number: NUMBERS[0] },
      { color: COLORS[1], shape: SHAPES[1], number: NUMBERS[1] },
      { color: COLORS[2], shape: SHAPES[2], number: NUMBERS[2] },
      { color: COLORS[3], shape: SHAPES[3], number: NUMBERS[3] },
    ];
    setTargetCards(targets);
    setCurrentRule(rules[Math.floor(Math.random() * rules.length)]);
    setConsecutiveCorrect(0);
  }, [rules]);

  const generateCard = useCallback((): Card => {
    return {
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      number: NUMBERS[Math.floor(Math.random() * NUMBERS.length)],
    };
  }, []);

  const findCorrectMatch = useCallback((card: Card, rule: Rule): number => {
    return targetCards.findIndex(target => {
      switch (rule) {
        case 'color': return target.color === card.color;
        case 'shape': return target.shape === card.shape;
        case 'number': return target.number === card.number;
      }
    });
  }, [targetCards]);

  const generateTrial = useCallback(() => {
    let card: Card;
    let attempts = 0;

    // Generate a card that has at least one match
    do {
      card = generateCard();
      attempts++;
    } while (
      attempts < 100 &&
      findCorrectMatch(card, currentRule) === -1
    );

    setCurrentCard(card);
    setSelectedIndex(null);
    setShowFeedback(false);
  }, [generateCard, findCorrectMatch, currentRule]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && !currentCard && targetCards.length > 0) {
      generateTrial();
    }
  }, [gameState.status, gameState.currentRound, currentCard, targetCards.length, generateTrial]);

  const handleCardSelect = (index: number) => {
    if (showFeedback || !currentCard) return;

    const correctIndex = findCorrectMatch(currentCard, currentRule);
    const isCorrect = index === correctIndex;

    setSelectedIndex(index);
    setShowFeedback(true);
    setFeedbackCorrect(isCorrect);
    recordResponse(isCorrect, 0);

    let newConsecutive = isCorrect ? consecutiveCorrect + 1 : 0;

    // Check if rule should switch
    if (newConsecutive >= config.runsBeforeSwitch) {
      const otherRules = rules.filter(r => r !== currentRule);
      const newRule = otherRules[Math.floor(Math.random() * otherRules.length)];
      setCurrentRule(newRule);
      newConsecutive = 0;
    }

    setConsecutiveCorrect(newConsecutive);

    setTimeout(() => {
      if (gameState.currentRound >= totalRounds) {
        completeGame();
      } else {
        nextRound();
        setCurrentCard(null);
      }
    }, 1000);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    initializeGame();
    setTimeout(generateTrial, 100);
  };
  const handleRestart = () => {
    resetGame();
    setCurrentCard(null);
    setTargetCards([]);
    showInstructions();
  };

  const renderCard = (card: Card, size: 'sm' | 'lg' = 'sm') => {
    const baseSize = size === 'lg' ? 'w-20 h-28' : 'w-16 h-24';
    const shapeSize = size === 'lg' ? 'text-2xl' : 'text-xl';

    return (
      <div className={cn(baseSize, 'bg-white rounded-lg flex flex-col items-center justify-center gap-1 shadow-lg')}>
        {Array.from({ length: card.number }).map((_, i) => (
          <span key={i} className={shapeSize} style={{ color: card.color }}>
            {card.shape}
          </span>
        ))}
      </div>
    );
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
        {/* Hidden rule hint (for debugging, remove in production) */}
        {/* <div className="text-xs text-gray-600 mb-2">Rule: {currentRule}</div> */}

        {/* Target Cards */}
        <div className="flex gap-4 mb-8">
          {targetCards.map((card, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = showFeedback && currentCard && index === findCorrectMatch(currentCard, currentRule);
            const isWrong = showFeedback && isSelected && currentCard && index !== findCorrectMatch(currentCard, currentRule);

            return (
              <motion.button
                key={index}
                onClick={() => handleCardSelect(index)}
                disabled={showFeedback}
                className={cn(
                  'p-2 rounded-xl border-4 transition-all',
                  isCorrect && 'border-success-500 bg-success-500/20',
                  isWrong && 'border-error-500 bg-error-500/20',
                  !showFeedback && 'border-transparent hover:border-electric-500/50',
                  isSelected && !showFeedback && 'border-electric-500'
                )}
                whileHover={!showFeedback ? { scale: 1.05 } : undefined}
                whileTap={!showFeedback ? { scale: 0.95 } : undefined}
              >
                {renderCard(card)}
              </motion.button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-full max-w-md border-t border-navy-600 mb-8" />

        {/* Current Card */}
        {currentCard && (
          <motion.div
            key={gameState.currentRound}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="text-sm text-gray-400 mb-2 text-center">Match this card:</div>
            {renderCard(currentCard, 'lg')}
          </motion.div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'mt-4 px-6 py-2 rounded-xl font-bold',
              feedbackCorrect ? 'bg-success-500/20 text-success-400' : 'bg-error-500/20 text-error-400'
            )}
          >
            {feedbackCorrect ? 'Correct!' : 'Try a different rule!'}
          </motion.div>
        )}

        {/* Streak indicator */}
        <div className="mt-4 text-xs text-gray-600">
          Streak: {consecutiveCorrect}
        </div>
      </div>
    </GameWrapper>
  );
}
