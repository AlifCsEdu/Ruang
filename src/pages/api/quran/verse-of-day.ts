import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Daily Verse of the Day API
 *
 * Selects a verse deterministically each day from a curated pool,
 * fetches it from the Quran CDN, and caches the result for 24 hours.
 * Zero upstream cost after the first request of the day.
 */

// Curated pool of meaningful verses (chapter:verse) — 36 entries
// Selected for spiritual reflection, motivation, and core Islamic teachings
const VERSE_POOL: { key: string; ref: string }[] = [
  { key: '2:255', ref: 'Ayatul Kursi' },
  { key: '2:286', ref: 'Allah does not burden a soul' },
  { key: '3:139', ref: 'Do not weaken' },
  { key: '13:28', ref: 'Hearts find rest in remembrance' },
  { key: '94:5', ref: 'With hardship comes ease' },
  { key: '94:6', ref: 'Indeed, with hardship comes ease' },
  { key: '2:152', ref: 'Remember Me, I remember you' },
  { key: '3:8', ref: 'Our Lord, let not our hearts deviate' },
  { key: '14:7', ref: 'If you are grateful, I will increase you' },
  { key: '2:186', ref: 'I am near, I answer the call' },
  { key: '65:3', ref: 'Allah is sufficient for whoever relies on Him' },
  { key: '3:173', ref: 'Allah is sufficient for us' },
  { key: '39:53', ref: 'Do not despair of Allah\'s mercy' },
  { key: '40:60', ref: 'Call upon Me, I will respond' },
  { key: '2:216', ref: 'Perhaps you dislike what is good for you' },
  { key: '57:4', ref: 'He is with you wherever you are' },
  { key: '6:59', ref: 'With Him are the keys of the unseen' },
  { key: '11:114', ref: 'Good deeds erase misdeeds' },
  { key: '18:10', ref: 'People of the Cave' },
  { key: '23:115', ref: 'Did you think We created you in vain?' },
  { key: '49:13', ref: 'Most noble is the most righteous' },
  { key: '67:2', ref: 'He who created death and life' },
  { key: '76:9', ref: 'We feed you for the sake of Allah' },
  { key: '103:1', ref: 'By time' },
  { key: '103:2', ref: 'Indeed, mankind is in loss' },
  { key: '103:3', ref: 'Except those who believe' },
  { key: '1:1', ref: 'In the name of Allah' },
  { key: '1:5', ref: 'You alone we worship' },
  { key: '36:82', ref: 'His command is only "Be" and it is' },
  { key: '42:30', ref: 'Whatever strikes you is from your own hands' },
  { key: '2:45', ref: 'Seek help through patience and prayer' },
  { key: '8:46', ref: 'Do not dispute, lest you lose courage' },
  { key: '16:97', ref: 'Whoever does good, male or female' },
  { key: '25:74', ref: 'Grant us comfort in our spouses' },
  { key: '10:57', ref: 'A healing for what is in the hearts' },
  { key: '24:35', ref: 'Allah is the Light of the heavens' },
];

export const GET: APIRoute = async ({ request }) => {
  // Select today's verse deterministically
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  const entry = VERSE_POOL[dayOfYear % VERSE_POOL.length];

  // Parse chapter and verse numbers
  const [chapterStr, verseStr] = entry.key.split(':');
  const chapterNum = Number(chapterStr);
  const verseNum = Number(verseStr);

  try {
    // Fetch the single verse from Quran CDN
    const url = `https://api.qurancdn.com/api/qdc/verses/by_key/${chapterNum}:${verseNum}` +
      `?language=en&words=false&translations=20&fields=text_uthmani&per_page=1`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Quran CDN returned ${res.status}`);

    const data = await res.json();
    const raw = data.verses?.[0];
    if (!raw) throw new Error('Verse not found');

    const verse = {
      key: entry.key,
      ref: entry.ref,
      text: String(raw.text_uthmani ?? raw.text ?? ''),
      translation: String(
        Array.isArray(raw.translations) && raw.translations[0]
          ? raw.translations[0].text
          : ''
      ),
      chapter: chapterNum,
      verse: verseNum,
    };

    return new Response(JSON.stringify(verse), {
      headers: {
        'Content-Type': 'application/json',
        // Cache for 24 hours at the edge — zero upstream cost after first fetch
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch {
    // Fallback: return just the reference without text
    return new Response(JSON.stringify({
      key: entry.key,
      ref: entry.ref,
      text: '',
      translation: 'Verse of the Day — read at /quran',
      chapter: chapterNum,
      verse: verseNum,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  }
};
