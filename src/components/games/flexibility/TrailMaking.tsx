'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameState } from '@/lib/hooks/useGameState';
import { GameWrapper } from '../GameWrapper';
import { cn } from '@/lib/utils/cn';

interface TrailMakingProps {
  difficulty?: number;
  onComplete?: (result: { score: number; accuracy: number }) => void;
  onExit?: () => void;
}

const DIFFICULTY_CONFIG = {
  1: { nodeCount: 6, type: 'numbers' as const },
  2: { nodeCount: 8, type: 'numbers' as const },
  3: { nodeCount: 10, type: 'numbers' as const },
  4: { nodeCount: 8, type: 'alternating' as const },
  5: { nodeCount: 10, type: 'alternating' as const },
  6: { nodeCount: 12, type: 'alternating' as const },
  7: { nodeCount: 14, type: 'alternating' as const },
  8: { nodeCount: 16, type: 'alternating' as const },
  9: { nodeCount: 18, type: 'alternating' as const },
  10: { nodeCount: 20, type: 'alternating' as const },
};

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
  order: number;
}

const gameConfig = {
  id: 'trail-making',
  name: 'Trail Making',
  description: 'Connect nodes in order as quickly as possible.',
  instructions: 'Connect the circles in order. For numbers-only: 1→2→3. For alternating: 1→A→2→B→3→C. Speed matters!',
  domain: 'flexibility',
};

export function TrailMaking({
  difficulty = 1,
  onComplete: _onComplete,
  onExit
}: TrailMakingProps) {
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

  const [nodes, setNodes] = useState<Node[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [connectedNodes, setConnectedNodes] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDifficulty(difficulty);
    showInstructions();
  }, [difficulty, setDifficulty, showInstructions]);

  const generateNodes = useCallback(() => {
    const newNodes: Node[] = [];
    const containerSize = 300;
    const nodeSize = 40;
    const margin = nodeSize;

    const labels: string[] = [];
    if (config.type === 'numbers') {
      for (let i = 1; i <= config.nodeCount; i++) {
        labels.push(i.toString());
      }
    } else {
      // Alternating: 1, A, 2, B, 3, C...
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let i = 0; i < config.nodeCount / 2; i++) {
        labels.push((i + 1).toString());
        if (i < letters.length) {
          labels.push(letters[i]);
        }
      }
    }

    // Generate random non-overlapping positions
    for (let i = 0; i < labels.length; i++) {
      let x: number, y: number;
      let attempts = 0;
      let valid = false;

      while (!valid && attempts < 100) {
        x = margin + Math.random() * (containerSize - 2 * margin);
        y = margin + Math.random() * (containerSize - 2 * margin);

        valid = newNodes.every(node =>
          Math.hypot(node.x - x!, node.y - y!) > nodeSize * 1.5
        );
        attempts++;
      }

      newNodes.push({
        id: i,
        x: x!,
        y: y!,
        label: labels[i],
        order: i
      });
    }

    setNodes(newNodes);
    setCurrentIndex(0);
    setConnectedNodes([]);
    setErrors(0);
    setIsComplete(false);
    setStartTime(Date.now());
  }, [config.nodeCount, config.type]);

  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentRound >= 1 && nodes.length === 0) {
      generateNodes();
    }
  }, [gameState.status, gameState.currentRound, nodes.length, generateNodes]);

  const handleNodeClick = (node: Node) => {
    if (isComplete || gameState.status !== 'playing') return;

    if (node.order === currentIndex) {
      // Correct!
      setConnectedNodes([...connectedNodes, node.id]);
      setCurrentIndex(currentIndex + 1);

      if (currentIndex + 1 >= nodes.length) {
        // Completed!
        setIsComplete(true);
        const timeTaken = Date.now() - (startTime || Date.now());
        const accuracy = Math.max(0, 1 - errors * 0.1);
        recordResponse(accuracy >= 0.7, timeTaken);

        setTimeout(() => {
          if (gameState.currentRound >= totalRounds) {
            completeGame();
          } else {
            nextRound();
            setNodes([]);
          }
        }, 1500);
      }
    } else {
      // Wrong!
      setErrors(errors + 1);
    }
  };

  const handleStart = () => startCountdown();
  const handleCountdownComplete = () => {
    startGame();
    generateNodes();
  };
  const handleRestart = () => {
    resetGame();
    setNodes([]);
    showInstructions();
  };

  const getNextLabel = () => {
    if (currentIndex >= nodes.length) return '';
    return nodes.find(n => n.order === currentIndex)?.label || '';
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
        {/* Instructions */}
        <div className="mb-4 text-center">
          <span className="text-sm text-gray-400">
            {config.type === 'numbers' ? 'Connect: 1 → 2 → 3...' : 'Connect: 1 → A → 2 → B...'}
          </span>
          <div className="text-lg text-white font-bold mt-1">
            Next: <span className="text-electric-400">{getNextLabel()}</span>
          </div>
        </div>

        {/* Game Area */}
        <div
          ref={containerRef}
          className="relative w-[300px] h-[300px] bg-navy-700 rounded-2xl border-2 border-navy-600"
        >
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connectedNodes.slice(1).map((nodeId, i) => {
              const fromNode = nodes.find(n => n.id === connectedNodes[i]);
              const toNode = nodes.find(n => n.id === nodeId);
              if (!fromNode || !toNode) return null;

              return (
                <motion.line
                  key={`${fromNode.id}-${toNode.id}`}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const isConnected = connectedNodes.includes(node.id);
            const isNext = node.order === currentIndex;
            const isNumber = !isNaN(parseInt(node.label));

            return (
              <motion.button
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className={cn(
                  'absolute w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                  isConnected && 'bg-success-500 text-white',
                  isNext && !isConnected && 'bg-electric-500 text-white ring-4 ring-electric-500/50',
                  !isConnected && !isNext && isNumber && 'bg-navy-600 text-white hover:bg-navy-500',
                  !isConnected && !isNext && !isNumber && 'bg-flexibility/20 text-flexibility border-2 border-flexibility hover:bg-flexibility/30'
                )}
                style={{
                  left: node.x - 20,
                  top: node.y - 20
                }}
                whileHover={!isConnected ? { scale: 1.1 } : undefined}
                whileTap={!isConnected ? { scale: 0.95 } : undefined}
              >
                {node.label}
              </motion.button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-white font-bold">{connectedNodes.length}/{nodes.length}</div>
            <div className="text-gray-500">Connected</div>
          </div>
          <div className="text-center">
            <div className="text-error-400 font-bold">{errors}</div>
            <div className="text-gray-500">Errors</div>
          </div>
        </div>

        {/* Completion */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 text-success-400 font-bold text-lg"
          >
            Complete! {errors === 0 ? 'Perfect!' : `${errors} errors`}
          </motion.div>
        )}
      </div>
    </GameWrapper>
  );
}
