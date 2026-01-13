import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { userStats } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - Fetch user's stats
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [stats] = await db()
      .select()
      .from(userStats)
      .where(eq(userStats.userId, session.user.id));

    if (!stats) {
      // Return default stats if none exist
      return NextResponse.json({
        totalGamesPlayed: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastPlayedDate: null,
        perfectGames: 0,
        totalCorrectAnswers: 0,
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
      });
    }

    // Transform to the expected format
    return NextResponse.json({
      totalGamesPlayed: stats.totalGamesPlayed || 0,
      currentStreak: stats.currentStreak || 0,
      longestStreak: stats.longestStreak || 0,
      lastPlayedDate: stats.lastPlayedDate,
      perfectGames: stats.perfectGames || 0,
      totalCorrectAnswers: stats.totalCorrectAnswers || 0,
      domainScores: {
        memory: stats.memoryScore || 50,
        attention: stats.attentionScore || 50,
        speed: stats.speedScore || 50,
        problem_solving: stats.problemSolvingScore || 50,
        flexibility: stats.flexibilityScore || 50,
      },
      domainGamesPlayed: {
        memory: stats.memoryGamesPlayed || 0,
        attention: stats.attentionGamesPlayed || 0,
        speed: stats.speedGamesPlayed || 0,
        problem_solving: stats.problemSolvingGamesPlayed || 0,
        flexibility: stats.flexibilityGamesPlayed || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
