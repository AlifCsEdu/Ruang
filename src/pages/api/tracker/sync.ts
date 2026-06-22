import type { APIRoute } from 'astro';

export const prerender = false;

const STREAK_KEY = 'prayer_streak';
const STREAK_TTL = 60 * 60 * 24 * 365; // 1 year in seconds

interface DayRecord {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

type StreakData = Record<string, DayRecord>;

/**
 * GET /api/tracker/sync — Retrieve prayer streak data from session.
 */
export const GET: APIRoute = async ({ session }) => {
  try {
    const data = await session.get(STREAK_KEY);
    const streakData: StreakData = data?.value ?? {};

    return new Response(JSON.stringify({ streak: streakData }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch {
    return new Response(JSON.stringify({ streak: {} }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-cache',
      },
    });
  }
};

/**
 * POST /api/tracker/sync — Save prayer streak data to session with 1-year TTL.
 * Body: { streak: Record<string, DayRecord> }
 */
export const POST: APIRoute = async ({ session, request }) => {
  try {
    const body = await request.json();
    const streak: StreakData = body.streak;

    if (!streak || typeof streak !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid streak data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await session.set(STREAK_KEY, streak, { maxAge: STREAK_TTL });

    return new Response(JSON.stringify({ ok: true, saved: Object.keys(streak).length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to save streak data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
