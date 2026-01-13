import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  primaryKey,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

// NextAuth required tables
export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // For credentials auth
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// Game results table
export const gameResults = pgTable('game_results', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  gameId: text('game_id').notNull(),
  gameName: text('game_name').notNull(),
  domain: text('domain').notNull(), // memory, attention, speed, problem_solving, flexibility
  score: integer('score').notNull(),
  accuracy: real('accuracy').notNull(),
  difficulty: integer('difficulty').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  totalRounds: integer('total_rounds').notNull(),
  completedAt: timestamp('completed_at', { mode: 'date' }).defaultNow(),
});

// User stats table (aggregated for performance)
export const userStats = pgTable('user_stats', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalGamesPlayed: integer('total_games_played').default(0),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastPlayedDate: text('last_played_date'),
  perfectGames: integer('perfect_games').default(0),
  totalCorrectAnswers: integer('total_correct_answers').default(0),
  // Domain scores
  memoryScore: integer('memory_score').default(50),
  attentionScore: integer('attention_score').default(50),
  speedScore: integer('speed_score').default(50),
  problemSolvingScore: integer('problem_solving_score').default(50),
  flexibilityScore: integer('flexibility_score').default(50),
  // Domain games played
  memoryGamesPlayed: integer('memory_games_played').default(0),
  attentionGamesPlayed: integer('attention_games_played').default(0),
  speedGamesPlayed: integer('speed_games_played').default(0),
  problemSolvingGamesPlayed: integer('problem_solving_games_played').default(0),
  flexibilityGamesPlayed: integer('flexibility_games_played').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// Achievements table
export const userAchievements = pgTable(
  'user_achievements',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    achievementId: text('achievement_id').notNull(),
    unlockedAt: timestamp('unlocked_at', { mode: 'date' }).defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.achievementId] }),
  })
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type GameResult = typeof gameResults.$inferSelect;
export type NewGameResult = typeof gameResults.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
