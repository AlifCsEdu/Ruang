import type { APIRoute } from 'astro';
import { SURAHS } from '../../../lib/quran/surahs';

export const prerender = false;

// Return the static surah list — no external API call needed
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ chapters: SURAHS }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
};
