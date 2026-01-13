'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameCountdownProps {
  duration?: number;
  onComplete: () => void;
}

export function GameCountdown({ duration = 3, onComplete }: GameCountdownProps) {
  const [count, setCount] = useState(duration);

  useEffect(() => {
    if (count === 0) {
      const timeout = setTimeout(onComplete, 500);
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {count > 0 ? (
            <>
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-electric-500"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              {/* Number */}
              <div className="w-32 h-32 rounded-full bg-electric-500/20 flex items-center justify-center">
                <span className="text-7xl font-bold text-electric-400">{count}</span>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold text-success-400"
            >
              GO!
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
