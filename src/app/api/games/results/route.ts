import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { gameResults, userStats } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { CognitiveDomain } from '@/types';

// GET - Fetch user's game results
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const results = await db()
      .select()
      .from(gameResults)
      .where(eq(gameResults.userId, session.user.id))
      .orderBy(desc(gameResults.completedAt))
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching game results:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

// POST - Save a game result
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameId, gameName, domain, score, accuracy, difficulty, correctAnswers, totalRounds } = body;

    // Validate required fields
    if (!gameId || !gameName || !domain || score === undefined || accuracy === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save game result
    const [result] = await db()
      .insert(gameResults)
      .values({
        userId: session.user.id,
        gameId,
        gameName,
        domain,
        score,
        accuracy,
        difficulty: difficulty || 1,
        correctAnswers: correctAnswers || 0,
        totalRounds: totalRounds || 1,
      })
      .returning();

    // Update user stats
    await updateUserStats(session.user.id, domain as CognitiveDomain, accuracy);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error saving game result:', error);
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 });
  }
}

async function updateUserStats(userId: string, domain: CognitiveDomain, accuracy: number) {
  const today = new Date().toISOString().split('T')[0];

  // Get current stats
  const [currentStats] = await db()
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId));

  if (!currentStats) {
    // Create initial stats
    const domainScoreField = getDomainScoreField(domain);
    const domainGamesField = getDomainGamesField(domain);

    await db().insert(userStats).values({
      userId,
      totalGamesPlayed: 1,
      currentStreak: 1,
      longestStreak: 1,
      lastPlayedDate: today,
      perfectGames: accuracy === 100 ? 1 : 0,
      [domainScoreField]: Math.round(accuracy),
      [domainGamesField]: 1,
    });
    return;
  }

  // Calculate streak
  let newStreak = currentStats.currentStreak || 0;
  let longestStreak = currentStats.longestStreak || 0;

  if (currentStats.lastPlayedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (currentStats.lastPlayedDate === yesterdayStr) {
      newStreak = (currentStats.currentStreak || 0) + 1;
    } else {
      newStreak = 1;
    }
    longestStreak = Math.max(longestStreak, newStreak);
  }

  // Calculate new domain score (weighted average)
  const domainScoreField = getDomainScoreField(domain) as keyof typeof currentStats;
  const domainGamesField = getDomainGamesField(domain) as keyof typeof currentStats;
  const oldScore = (currentStats[domainScoreField] as number | null) || 50;
  const gamesInDomain = (currentStats[domainGamesField] as number | null) || 0;
  const weight = Math.min(0.3, 1 / (gamesInDomain + 1));
  const newDomainScore = Math.round(oldScore * (1 - weight) + accuracy * weight);

  // Update stats
  await db()
    .update(userStats)
    .set({
      totalGamesPlayed: (currentStats.totalGamesPlayed || 0) + 1,
      currentStreak: newStreak,
      longestStreak,
      lastPlayedDate: today,
      perfectGames: accuracy === 100 ? (currentStats.perfectGames || 0) + 1 : currentStats.perfectGames,
      [domainScoreField]: newDomainScore,
      [domainGamesField]: gamesInDomain + 1,
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId));
}

function getDomainScoreField(domain: CognitiveDomain): string {
  const map: Record<CognitiveDomain, string> = {
    memory: 'memoryScore',
    attention: 'attentionScore',
    speed: 'speedScore',
    problem_solving: 'problemSolvingScore',
    flexibility: 'flexibilityScore',
  };
  return map[domain];
}

function getDomainGamesField(domain: CognitiveDomain): string {
  const map: Record<CognitiveDomain, string> = {
    memory: 'memoryGamesPlayed',
    attention: 'attentionGamesPlayed',
    speed: 'speedGamesPlayed',
    problem_solving: 'problemSolvingGamesPlayed',
    flexibility: 'flexibilityGamesPlayed',
  };
  return map[domain];
}
