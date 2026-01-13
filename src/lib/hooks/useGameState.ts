'use client';

import { useState, useCallback } from 'react';
import type { GameState } from '@/types';

const initialGameState: GameState = {
  status: 'idle',
  score: 0,
  accuracy: 0,
  reactionTimes: [],
  currentRound: 0,
  totalRounds: 0,
  difficulty: 1,
  streak: 0,
  bestStreak: 0,
};

export function useGameState(totalRounds: number = 20, initialDifficulty: number = 1) {
  const [state, setState] = useState<GameState>({
    ...initialGameState,
    totalRounds,
    difficulty: initialDifficulty,
  });

  const startGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'playing',
      startTime: Date.now(),
      currentRound: 1,
      score: 0,
      accuracy: 0,
      reactionTimes: [],
      streak: 0,
      bestStreak: 0,
    }));
  }, []);

  const showInstructions = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'instructions' }));
  }, []);

  const startPractice = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'practice' }));
  }, []);

  const startCountdown = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'countdown' }));
  }, []);

  const pauseGame = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeGame = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'playing' }));
  }, []);

  const completeGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: 'complete',
      endTime: Date.now(),
    }));
  }, []);

  const nextRound = useCallback(() => {
    setState((prev) => {
      const newRound = prev.currentRound + 1;
      if (newRound > prev.totalRounds) {
        return {
          ...prev,
          status: 'complete',
          endTime: Date.now(),
        };
      }
      return {
        ...prev,
        currentRound: newRound,
      };
    });
  }, []);

  const addScore = useCallback((points: number) => {
    setState((prev) => ({
      ...prev,
      score: prev.score + points,
    }));
  }, []);

  const recordResponse = useCallback((correct: boolean, reactionTime?: number) => {
    setState((prev) => {
      const newReactionTimes = reactionTime
        ? [...prev.reactionTimes, reactionTime]
        : prev.reactionTimes;

      const newStreak = correct ? prev.streak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);

      // Calculate accuracy
      const totalResponses = prev.reactionTimes.length + 1;
      const correctResponses = correct
        ? Math.round(prev.accuracy / 100 * prev.reactionTimes.length) + 1
        : Math.round(prev.accuracy / 100 * prev.reactionTimes.length);
      const newAccuracy = (correctResponses / totalResponses) * 100;

      return {
        ...prev,
        reactionTimes: newReactionTimes,
        streak: newStreak,
        bestStreak: newBestStreak,
        accuracy: newAccuracy,
        score: correct ? prev.score + (10 * (1 + newStreak * 0.1)) : prev.score,
      };
    });
  }, []);

  const setDifficulty = useCallback((difficulty: number) => {
    setState((prev) => ({ ...prev, difficulty }));
  }, []);

  const setLives = useCallback((lives: number) => {
    setState((prev) => ({ ...prev, lives }));
  }, []);

  const loseLife = useCallback(() => {
    setState((prev) => {
      const newLives = (prev.lives || 0) - 1;
      if (newLives <= 0) {
        return {
          ...prev,
          lives: 0,
          status: 'complete',
          endTime: Date.now(),
        };
      }
      return {
        ...prev,
        lives: newLives,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({
      ...initialGameState,
      totalRounds,
      difficulty: initialDifficulty,
    });
  }, [totalRounds, initialDifficulty]);

  const getAverageReactionTime = useCallback(() => {
    if (state.reactionTimes.length === 0) return 0;
    return state.reactionTimes.reduce((a, b) => a + b, 0) / state.reactionTimes.length;
  }, [state.reactionTimes]);

  const getDuration = useCallback(() => {
    if (!state.startTime) return 0;
    const endTime = state.endTime || Date.now();
    return Math.floor((endTime - state.startTime) / 1000);
  }, [state.startTime, state.endTime]);

  return {
    state,
    startGame,
    showInstructions,
    startPractice,
    startCountdown,
    pauseGame,
    resumeGame,
    completeGame,
    nextRound,
    addScore,
    recordResponse,
    setDifficulty,
    setLives,
    loseLife,
    resetGame,
    getAverageReactionTime,
    getDuration,
  };
}
