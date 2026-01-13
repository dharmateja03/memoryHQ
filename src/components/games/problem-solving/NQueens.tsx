'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';
import { Crown, X, Clock } from 'lucide-react';

interface NQueensProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { boardSize: 4, timeLimit: 120 },
  2: { boardSize: 4, timeLimit: 90 },
  3: { boardSize: 5, timeLimit: 150 },
  4: { boardSize: 5, timeLimit: 120 },
  5: { boardSize: 6, timeLimit: 180 },
  6: { boardSize: 6, timeLimit: 150 },
  7: { boardSize: 7, timeLimit: 240 },
  8: { boardSize: 7, timeLimit: 200 },
  9: { boardSize: 8, timeLimit: 300 },
  10: { boardSize: 8, timeLimit: 240 },
};

const gameConfig = {
  id: 'n-queens',
  name: 'N-Queens',
  description: 'Place N queens on an NxN chessboard so no two queens threaten each other.',
  instructions: 'Place queens on the board such that no two queens can attack each other. Queens attack horizontally, vertically, and diagonally. Click a cell to place or remove a queen.',
  domain: 'problem_solving',
};

export function NQueens({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: NQueensProps) {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG[1];
  const totalRounds = 3;

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

  const [board, setBoard] = useState<boolean[][]>([]);
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimit);
  const [roundStartTime, setRoundStartTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const initializeBoard = useCallback(() => {
    const newBoard = Array(config.boardSize).fill(null).map(() =>
      Array(config.boardSize).fill(false)
    );
    setBoard(newBoard);
    setConflicts(new Set());
    setIsComplete(false);
    setTimeRemaining(config.timeLimit);
    setRoundStartTime(Date.now());
  }, [config.boardSize, config.timeLimit]);

  // Timer effect
  useEffect(() => {
    if (gameState.status === 'playing' && !isComplete) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - record as failure and move to next round
            if (timerRef.current) clearInterval(timerRef.current);
            recordResponse(false, 0);

            setTimeout(() => {
              if (gameState.currentRound >= totalRounds) {
                completeGame();
              } else {
                nextRound();
                setBoard([]);
              }
            }, 1000);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status, isComplete, gameState.currentRound, totalRounds, completeGame, nextRound, recordResponse]);

  // Pause timer when paused
  useEffect(() => {
    if (gameState.status === 'paused' && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameState.status]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && board.length === 0) {
      initializeBoard();
    }
  }, [gameState.status, gameState.currentRound, board.length, initializeBoard]);

  // Check for conflicts and completion
  const checkBoard = useCallback((currentBoard: boolean[][]) => {
    const size = currentBoard.length;
    const newConflicts = new Set<string>();
    let queenCount = 0;
    const queenPositions: [number, number][] = [];

    // Find all queens
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (currentBoard[row][col]) {
          queenCount++;
          queenPositions.push([row, col]);
        }
      }
    }

    // Check for conflicts between each pair of queens
    for (let i = 0; i < queenPositions.length; i++) {
      for (let j = i + 1; j < queenPositions.length; j++) {
        const [r1, c1] = queenPositions[i];
        const [r2, c2] = queenPositions[j];

        // Same row
        if (r1 === r2) {
          newConflicts.add(`${r1},${c1}`);
          newConflicts.add(`${r2},${c2}`);
        }
        // Same column
        if (c1 === c2) {
          newConflicts.add(`${r1},${c1}`);
          newConflicts.add(`${r2},${c2}`);
        }
        // Same diagonal
        if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
          newConflicts.add(`${r1},${c1}`);
          newConflicts.add(`${r2},${c2}`);
        }
      }
    }

    setConflicts(newConflicts);

    // Check if puzzle is solved
    if (queenCount === size && newConflicts.size === 0) {
      setIsComplete(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeTaken = roundStartTime ? (Date.now() - roundStartTime) / 1000 : 0;
      recordResponse(true, timeTaken * 1000);

      setTimeout(() => {
        if (gameState.currentRound >= totalRounds) {
          completeGame();
        } else {
          nextRound();
          setBoard([]);
        }
      }, 2000);
    }
  }, [gameState.currentRound, totalRounds, completeGame, nextRound, recordResponse, config.timeLimit, roundStartTime]);

  const handleCellClick = (row: number, col: number) => {
    if (isComplete || gameState.status !== 'playing') return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = !newBoard[row][col];
    setBoard(newBoard);
    checkBoard(newBoard);
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    initializeBoard();
  };
  const handleRestart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    resetGame();
    setBoard([]);
    showInstructions();
  };

  const getQueenCount = () => {
    return board.flat().filter(Boolean).length;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCellColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    return isLight ? 'bg-amber-100' : 'bg-amber-700';
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
      showTimer={true}
      timeRemaining={timeRemaining}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        {/* Stats */}
        <div className="mb-6 flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-white font-bold text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              {getQueenCount()} / {config.boardSize}
            </div>
            <div className="text-gray-500">Queens Placed</div>
          </div>
          <div className="text-center">
            <div className={cn(
              "font-bold text-lg flex items-center gap-2",
              conflicts.size > 0 ? "text-red-400" : "text-success-400"
            )}>
              {conflicts.size > 0 ? <X className="w-5 h-5" /> : null}
              {conflicts.size === 0 ? 'No Conflicts' : `${conflicts.size / 2} Conflicts`}
            </div>
            <div className="text-gray-500">Status</div>
          </div>
          <div className="text-center">
            <div className={cn(
              "font-bold text-lg flex items-center gap-2",
              timeRemaining <= 30 ? "text-red-400" : "text-electric-400"
            )}>
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
            <div className="text-gray-500">Time Left</div>
          </div>
        </div>

        {/* Board */}
        <div
          className="grid gap-0 rounded-lg overflow-hidden shadow-xl border-2 border-amber-900"
          style={{
            gridTemplateColumns: `repeat(${config.boardSize}, 1fr)`,
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((hasQueen, colIndex) => {
              const cellKey = `${rowIndex},${colIndex}`;
              const hasConflict = conflicts.has(cellKey);

              return (
                <motion.div
                  key={cellKey}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={cn(
                    'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer transition-all relative',
                    getCellColor(rowIndex, colIndex),
                    hasConflict && 'ring-2 ring-red-500 ring-inset',
                    !hasQueen && 'hover:brightness-110'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {hasQueen && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Crown
                        className={cn(
                          'w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg',
                          hasConflict ? 'text-red-500' : 'text-yellow-400'
                        )}
                        fill={hasConflict ? '#ef4444' : '#facc15'}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Instructions */}
        {!isComplete && timeRemaining > 0 && (
          <div className="mt-6 text-sm text-gray-500 text-center max-w-md">
            Place {config.boardSize} queens so no two attack each other.
            Queens attack horizontally, vertically, and diagonally.
          </div>
        )}

        {/* Time's up message */}
        {timeRemaining === 0 && !isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-center"
          >
            <div className="text-2xl font-bold text-red-400 mb-2">Time&apos;s Up!</div>
            <div className="text-sm text-gray-400">Moving to next round...</div>
          </motion.div>
        )}

        {/* Completion message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-center"
          >
            <div className="text-2xl font-bold text-success-400 mb-2">Solved!</div>
            <div className="text-sm text-gray-400">
              Completed with {formatTime(config.timeLimit - timeRemaining)} remaining
            </div>
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
