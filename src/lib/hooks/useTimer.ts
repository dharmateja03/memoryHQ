'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  initialTime?: number; // in seconds
  countDown?: boolean;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useTimer({
  initialTime = 0,
  countDown = false,
  onComplete,
  autoStart = false,
}: UseTimerOptions = {}) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (countDown) {
            if (prev <= 1) {
              setIsRunning(false);
              onCompleteRef.current?.();
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, countDown]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setTime(newTime ?? initialTime);
    setIsRunning(false);
  }, [initialTime]);

  const restart = useCallback((newTime?: number) => {
    setTime(newTime ?? initialTime);
    setIsRunning(true);
  }, [initialTime]);

  const formatTime = useCallback((seconds: number = time) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [time]);

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    restart,
    formatTime,
  };
}

// Countdown hook for game countdowns (3, 2, 1, GO!)
export function useCountdown(onComplete: () => void, duration: number = 3) {
  const [count, setCount] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || count === null) return;

    if (count === 0) {
      setIsActive(false);
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isActive, onComplete]);

  const start = useCallback(() => {
    setCount(duration);
    setIsActive(true);
  }, [duration]);

  const reset = useCallback(() => {
    setCount(null);
    setIsActive(false);
  }, []);

  return {
    count,
    isActive,
    start,
    reset,
  };
}

// Reaction time measurement hook
export function useReactionTime() {
  const startTimeRef = useRef<number | null>(null);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const stop = useCallback((): number => {
    if (startTimeRef.current === null) return 0;
    const reactionTime = performance.now() - startTimeRef.current;
    startTimeRef.current = null;
    return Math.round(reactionTime);
  }, []);

  const reset = useCallback(() => {
    startTimeRef.current = null;
  }, []);

  return {
    start,
    stop,
    reset,
  };
}
