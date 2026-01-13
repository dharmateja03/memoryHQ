// Cognitive Domains
export type CognitiveDomain = 'memory' | 'attention' | 'speed' | 'problem_solving' | 'flexibility';

export const DOMAIN_LABELS: Record<CognitiveDomain, string> = {
  memory: 'Memory',
  attention: 'Attention',
  speed: 'Processing Speed',
  problem_solving: 'Problem Solving',
  flexibility: 'Cognitive Flexibility',
};

export const DOMAIN_COLORS: Record<CognitiveDomain, string> = {
  memory: '#8B5CF6',
  attention: '#EC4899',
  speed: '#F97316',
  problem_solving: '#06B6D4',
  flexibility: '#84CC16',
};

// Game Types
export interface GameConfig {
  id: string;
  name: string;
  description: string;
  domain: CognitiveDomain;
  instructions: string;
  difficulty: number;
  duration?: number; // in seconds
  practiceAvailable: boolean;
}

export interface GameState {
  status: 'idle' | 'instructions' | 'practice' | 'countdown' | 'playing' | 'paused' | 'complete';
  score: number;
  accuracy: number;
  reactionTimes: number[];
  startTime?: number;
  endTime?: number;
  currentRound: number;
  totalRounds: number;
  difficulty: number;
  lives?: number;
  streak: number;
  bestStreak: number;
}

export interface GameResult {
  gameId: string;
  userId: string;
  score: number;
  accuracy: number;
  averageReactionTime: number;
  difficulty: number;
  duration: number;
  completedAt: Date;
  roundsCompleted: number;
  perfectRounds: number;
  streak: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: Date;
  subscription_tier: 'free' | 'premium' | 'pro';
  assessment_completed: boolean;
  onboarding_completed: boolean;
}

export interface CognitiveProfile {
  user_id: string;
  memory_score: number;
  memory_difficulty: number;
  attention_score: number;
  attention_difficulty: number;
  speed_score: number;
  speed_difficulty: number;
  problem_solving_score: number;
  problem_solving_difficulty: number;
  flexibility_score: number;
  flexibility_difficulty: number;
  overall_score: number;
  strongest_domain: CognitiveDomain;
  weakest_domain: CognitiveDomain;
  last_assessment_date: Date;
  updated_at: Date;
}

// Assessment Types
export interface AssessmentTest {
  id: string;
  gameId: string;
  domain: CognitiveDomain;
  order: number;
  weight: number;
}

export interface AssessmentResult {
  userId: string;
  testId: string;
  domain: CognitiveDomain;
  rawScore: number;
  percentileScore: number;
  reactionTime?: number;
  accuracy: number;
  completedAt: Date;
}

export interface AssessmentSession {
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  results: AssessmentResult[];
  cognitiveProfile?: CognitiveProfile;
}

// Daily Training Types
export interface DailyPlan {
  id: string;
  userId: string;
  date: Date;
  games: DailyGameSlot[];
  completed: boolean;
  completedAt?: Date;
}

export interface DailyGameSlot {
  id: string;
  gameId: string;
  domain: CognitiveDomain;
  difficulty: number;
  order: number;
  completed: boolean;
  result?: GameResult;
}

// Progress Types
export interface ProgressSnapshot {
  userId: string;
  date: Date;
  memoryScore: number;
  attentionScore: number;
  speedScore: number;
  problemSolvingScore: number;
  flexibilityScore: number;
  overallScore: number;
  gamesPlayed: number;
  trainingMinutes: number;
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastTrainingDate: Date;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  category: 'games' | 'streak' | 'score' | 'special';
}

export interface UserAchievement {
  achievementId: string;
  userId: string;
  unlockedAt: Date;
}

// Game-specific types
export interface NBackTrial {
  position: number; // 0-8 for 3x3 grid
  letter?: string;
  isPositionMatch: boolean;
  isLetterMatch: boolean;
}

export interface MemoryMatrixTrial {
  sequence: number[];
  gridSize: number;
}

export interface CardPair {
  id: string;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface StroopTrial {
  word: string;
  color: string;
  isCongruent: boolean;
}

export interface FlankerTrial {
  arrows: string;
  correctResponse: 'left' | 'right' | 'up' | 'down';
}
