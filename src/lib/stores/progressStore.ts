import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CognitiveDomain } from '@/types';

// Game result stored locally
export interface StoredGameResult {
  id: string;
  gameId: string;
  gameName: string;
  domain: CognitiveDomain;
  score: number;
  accuracy: number;
  difficulty: number;
  completedAt: string;
  correctAnswers: number;
  totalRounds: number;
}

// Today's training game
export interface TodayGame {
  id: string;
  gameId: string;
  name: string;
  domain: CognitiveDomain;
  difficulty: number;
  completed: boolean;
  result?: StoredGameResult;
}

// Achievement definition
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'games' | 'streak' | 'score' | 'special';
  requirement: number;
  checkFn: (stats: ProgressStats) => boolean;
}

// User's unlocked achievement
export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

// Domain scores
export interface DomainScores {
  memory: number;
  attention: number;
  speed: number;
  problem_solving: number;
  flexibility: number;
}

// Overall progress stats
export interface ProgressStats {
  totalGamesPlayed: number;
  gamesPlayedToday: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  domainScores: DomainScores;
  domainGamesPlayed: Record<CognitiveDomain, number>;
  perfectGames: number;
  totalCorrectAnswers: number;
}

// All games available in the app (IDs must match GAME_COMPONENTS in [gameId]/page.tsx)
const ALL_GAMES: { id: string; name: string; domain: CognitiveDomain }[] = [
  // Memory
  { id: 'memory-matrix', name: 'Memory Matrix', domain: 'memory' },
  { id: 'memory-span', name: 'Memory Span', domain: 'memory' },
  { id: 'n-back', name: 'N-Back', domain: 'memory' },
  { id: 'word-recall', name: 'Word Recall', domain: 'memory' },
  { id: 'spatial-memory', name: 'Spatial Memory', domain: 'memory' },
  { id: 'visual-pairs', name: 'Visual Pairs', domain: 'memory' },
  // Attention
  { id: 'stroop-test', name: 'Stroop Test', domain: 'attention' },
  { id: 'visual-search', name: 'Visual Search', domain: 'attention' },
  { id: 'sustained-attention', name: 'Sustained Attention', domain: 'attention' },
  { id: 'divided-attention', name: 'Divided Attention', domain: 'attention' },
  { id: 'flanker-task', name: 'Flanker Task', domain: 'attention' },
  { id: 'change-detection', name: 'Change Detection', domain: 'attention' },
  // Speed
  { id: 'simple-reaction', name: 'Simple Reaction', domain: 'speed' },
  { id: 'choice-reaction', name: 'Choice Reaction', domain: 'speed' },
  { id: 'rapid-visual', name: 'Rapid Visual', domain: 'speed' },
  { id: 'symbol-matching', name: 'Symbol Matching', domain: 'speed' },
  { id: 'color-tap', name: 'Color Tap', domain: 'speed' },
  { id: 'motion-tracking', name: 'Motion Tracking', domain: 'speed' },
  // Problem Solving
  { id: 'number-series', name: 'Number Series', domain: 'problem_solving' },
  { id: 'matrix-reasoning', name: 'Matrix Reasoning', domain: 'problem_solving' },
  { id: 'tower-of-hanoi', name: 'Tower of Hanoi', domain: 'problem_solving' },
  { id: 'pattern-completion', name: 'Pattern Completion', domain: 'problem_solving' },
  { id: 'logical-deduction', name: 'Logical Deduction', domain: 'problem_solving' },
  { id: 'spatial-reasoning', name: 'Spatial Reasoning', domain: 'problem_solving' },
  // Flexibility
  { id: 'task-switching', name: 'Task Switching', domain: 'flexibility' },
  { id: 'category-switching', name: 'Category Switching', domain: 'flexibility' },
  { id: 'reverse-stroop', name: 'Reverse Stroop', domain: 'flexibility' },
  { id: 'wisconsin-card', name: 'Wisconsin Card', domain: 'flexibility' },
  { id: 'trail-making', name: 'Trail Making', domain: 'flexibility' },
  { id: 'verbal-fluency', name: 'Verbal Fluency', domain: 'flexibility' },
];

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
  // Games achievements
  { id: 'first-game', name: 'First Steps', description: 'Complete your first game', icon: '🎮', category: 'games', requirement: 1, checkFn: (s) => s.totalGamesPlayed >= 1 },
  { id: 'ten-games', name: 'Getting Started', description: 'Complete 10 games', icon: '🎯', category: 'games', requirement: 10, checkFn: (s) => s.totalGamesPlayed >= 10 },
  { id: 'fifty-games', name: 'Dedicated Trainer', description: 'Complete 50 games', icon: '💪', category: 'games', requirement: 50, checkFn: (s) => s.totalGamesPlayed >= 50 },
  { id: 'hundred-games', name: 'Century Club', description: 'Complete 100 games', icon: '🏆', category: 'games', requirement: 100, checkFn: (s) => s.totalGamesPlayed >= 100 },
  { id: 'five-hundred-games', name: 'Brain Master', description: 'Complete 500 games', icon: '👑', category: 'games', requirement: 500, checkFn: (s) => s.totalGamesPlayed >= 500 },

  // Streak achievements
  { id: 'streak-3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', requirement: 3, checkFn: (s) => s.currentStreak >= 3 },
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', category: 'streak', requirement: 7, checkFn: (s) => s.currentStreak >= 7 },
  { id: 'streak-14', name: 'Fortnight Focus', description: 'Maintain a 14-day streak', icon: '🌟', category: 'streak', requirement: 14, checkFn: (s) => s.currentStreak >= 14 },
  { id: 'streak-30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🏅', category: 'streak', requirement: 30, checkFn: (s) => s.currentStreak >= 30 },

  // Score achievements
  { id: 'perfect-game', name: 'Perfect!', description: 'Get 100% accuracy in a game', icon: '✨', category: 'score', requirement: 1, checkFn: (s) => s.perfectGames >= 1 },
  { id: 'ten-perfect', name: 'Precision Pro', description: 'Get 10 perfect games', icon: '💎', category: 'score', requirement: 10, checkFn: (s) => s.perfectGames >= 10 },

  // Special achievements
  { id: 'all-domains', name: 'Well Rounded', description: 'Play a game in each domain', icon: '🧠', category: 'special', requirement: 5, checkFn: (s) => Object.values(s.domainGamesPlayed).filter(v => v > 0).length >= 5 },
  { id: 'memory-master', name: 'Memory Master', description: 'Play 20 memory games', icon: '🎭', category: 'special', requirement: 20, checkFn: (s) => s.domainGamesPlayed.memory >= 20 },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Play 20 speed games', icon: '⚡', category: 'special', requirement: 20, checkFn: (s) => s.domainGamesPlayed.speed >= 20 },
];

interface ProgressState {
  // Game history
  gameResults: StoredGameResult[];

  // Today's training
  todayGames: TodayGame[];
  todayDate: string | null;

  // Achievements
  unlockedAchievements: UnlockedAchievement[];

  // Stats
  stats: ProgressStats;

  // Actions
  recordGameResult: (result: Omit<StoredGameResult, 'id'>) => void;
  generateTodayGames: () => void;
  markTodayGameComplete: (gameId: string, result: StoredGameResult) => void;
  checkAndUnlockAchievements: () => string[];
  getRecentActivity: (limit?: number) => StoredGameResult[];
  getDomainScore: (domain: CognitiveDomain) => number;
  getOverallScore: () => number;
  resetProgress: () => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

const initialStats: ProgressStats = {
  totalGamesPlayed: 0,
  gamesPlayedToday: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  domainScores: {
    memory: 50,
    attention: 50,
    speed: 50,
    problem_solving: 50,
    flexibility: 50,
  },
  domainGamesPlayed: {
    memory: 0,
    attention: 0,
    speed: 0,
    problem_solving: 0,
    flexibility: 0,
  },
  perfectGames: 0,
  totalCorrectAnswers: 0,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      gameResults: [],
      todayGames: [],
      todayDate: null,
      unlockedAchievements: [],
      stats: initialStats,

      recordGameResult: (result) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newResult: StoredGameResult = { ...result, id };
        const today = getToday();

        set((state) => {
          // Update streak
          let newStreak = state.stats.currentStreak;
          let longestStreak = state.stats.longestStreak;
          const lastDate = state.stats.lastPlayedDate;

          if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastDate === yesterdayStr) {
              newStreak = state.stats.currentStreak + 1;
            } else if (lastDate !== today) {
              newStreak = 1;
            }
            longestStreak = Math.max(longestStreak, newStreak);
          }

          // Calculate new domain score (weighted average with new result)
          const domain = result.domain;
          const oldScore = state.stats.domainScores[domain];
          const gamesInDomain = state.stats.domainGamesPlayed[domain];
          const weight = Math.min(0.3, 1 / (gamesInDomain + 1));
          const newDomainScore = Math.round(oldScore * (1 - weight) + result.accuracy * weight);

          // Count games played today
          const gamesPlayedToday = lastDate === today
            ? state.stats.gamesPlayedToday + 1
            : 1;

          return {
            gameResults: [newResult, ...state.gameResults].slice(0, 500), // Keep last 500
            stats: {
              ...state.stats,
              totalGamesPlayed: state.stats.totalGamesPlayed + 1,
              gamesPlayedToday,
              currentStreak: newStreak,
              longestStreak,
              lastPlayedDate: today,
              domainScores: {
                ...state.stats.domainScores,
                [domain]: newDomainScore,
              },
              domainGamesPlayed: {
                ...state.stats.domainGamesPlayed,
                [domain]: state.stats.domainGamesPlayed[domain] + 1,
              },
              perfectGames: result.accuracy === 100
                ? state.stats.perfectGames + 1
                : state.stats.perfectGames,
              totalCorrectAnswers: state.stats.totalCorrectAnswers + result.correctAnswers,
            },
          };
        });

        // Check for new achievements
        get().checkAndUnlockAchievements();
      },

      generateTodayGames: () => {
        const today = getToday();
        const state = get();

        // If already generated for today, don't regenerate
        if (state.todayDate === today && state.todayGames.length > 0) {
          return;
        }

        // Pick 5 games from different domains
        const domains: CognitiveDomain[] = ['memory', 'attention', 'speed', 'problem_solving', 'flexibility'];
        const shuffledDomains = [...domains].sort(() => Math.random() - 0.5);

        const todayGames: TodayGame[] = shuffledDomains.slice(0, 5).map((domain, index) => {
          const domainGames = ALL_GAMES.filter(g => g.domain === domain);
          const game = domainGames[Math.floor(Math.random() * domainGames.length)];

          // Difficulty based on domain score
          const domainScore = state.stats.domainScores[domain];
          const difficulty = Math.max(1, Math.min(10, Math.round(domainScore / 10)));

          return {
            id: `today-${index}-${game.id}`,
            gameId: game.id,
            name: game.name,
            domain,
            difficulty,
            completed: false,
          };
        });

        set({ todayGames, todayDate: today });
      },

      markTodayGameComplete: (gameId, result) => {
        set((state) => ({
          todayGames: state.todayGames.map(g =>
            g.gameId === gameId ? { ...g, completed: true, result } : g
          ),
        }));
      },

      checkAndUnlockAchievements: () => {
        const state = get();
        const newlyUnlocked: string[] = [];

        ACHIEVEMENTS.forEach(achievement => {
          const alreadyUnlocked = state.unlockedAchievements.some(
            ua => ua.achievementId === achievement.id
          );

          if (!alreadyUnlocked && achievement.checkFn(state.stats)) {
            newlyUnlocked.push(achievement.id);
          }
        });

        if (newlyUnlocked.length > 0) {
          set((state) => ({
            unlockedAchievements: [
              ...state.unlockedAchievements,
              ...newlyUnlocked.map(id => ({
                achievementId: id,
                unlockedAt: new Date().toISOString(),
              })),
            ],
          }));
        }

        return newlyUnlocked;
      },

      getRecentActivity: (limit = 10) => {
        return get().gameResults.slice(0, limit);
      },

      getDomainScore: (domain) => {
        return get().stats.domainScores[domain];
      },

      getOverallScore: () => {
        const scores = get().stats.domainScores;
        return Math.round(
          (scores.memory + scores.attention + scores.speed + scores.problem_solving + scores.flexibility) / 5
        );
      },

      resetProgress: () => {
        set({
          gameResults: [],
          todayGames: [],
          todayDate: null,
          unlockedAchievements: [],
          stats: initialStats,
        });
      },
    }),
    {
      name: 'mindforge-progress',
    }
  )
);

// Export achievements for UI
export const getAchievements = () => ACHIEVEMENTS;
export const getAchievementById = (id: string) => ACHIEVEMENTS.find(a => a.id === id);
