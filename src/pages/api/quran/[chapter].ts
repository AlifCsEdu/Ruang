import type { APIRoute } from 'astro';
import type { Verse, Word } from '../../../lib/quran/types';
import { SURAHS } from '../../../lib/quran/surahs';
import { VERSES_PER_PAGE, SHORT_SURAH_THRESHOLD } from '../../../lib/quran/constants';

export const prerender = false;

// Audio CDN base URL — prepend to relative audio paths from the API
const AUDIO_CDN = 'https://verses.quran.com/';

export const GET: APIRoute = async ({ params, url }) => {
  const chapterNum = Number(params.chapter);

  if (!chapterNum || chapterNum < 1 || chapterNum > 114) {
    return new Response(JSON.stringify({ error: 'Invalid chapter number' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const surah = SURAHS.find((s) => s.number === chapterNum);
  if (!surah) {
    return new Response(JSON.stringify({ error: 'Chapter not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Query params: reciter, translation, page, perPage
  const reciter = parseInt(url.searchParams.get('reciter') ?? '7', 10);
  const translation = parseInt(url.searchParams.get('translation') ?? '131', 10);
  const requestedPage = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(300, Math.max(1, parseInt(url.searchParams.get('perPage') ?? String(VERSES_PER_PAGE), 10)));

  // Short surahs: load all verses, no pagination
  const isShort = surah.versesCount <= SHORT_SURAH_THRESHOLD;
  const effectivePerPage = isShort ? surah.versesCount : perPage;
  const effectivePage = isShort ? 1 : requestedPage;

  try {
    const { verses, totalPages } = await fetchPage(chapterNum, effectivePage, effectivePerPage, reciter, translation);

    return new Response(JSON.stringify({
      surah,
      verses,
      pagination: {
        page: effectivePage,
        perPage: effectivePerPage,
        totalVerses: surah.versesCount,
        totalPages: isShort ? 1 : totalPages,
        isShortSurah: isShort,
      },
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    const status = (err as Error).message.includes('429') ? 429 : 502;
    return new Response(JSON.stringify({ error: 'Failed to fetch chapter' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Fetch a single page of verses with configurable reciter and translation.
 */
async function fetchPage(
  chapterNum: number,
  page: number,
  perPage: number,
  reciter: number,
  translation: number,
): Promise<{ verses: Verse[]; totalPages: number }> {
  const url = `https://api.qurancdn.com/api/qdc/verses/by_chapter/${chapterNum}` +
    `?language=en&words=true&translations=${translation}&audio=${reciter}` +
    `&fields=text_uthmani&per_page=${perPage}&page=${page}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Quran API returned ${res.status}`);
  }

  const data = await res.json();
  const pagination = data.pagination ?? {};
  const totalPages = pagination.total_pages ?? 1;

  const rawVerses: unknown[] = data.verses ?? [];
  const verses: Verse[] = rawVerses.map((raw) => mapVerse(raw as Record<string, unknown>));

  return { verses, totalPages };
}

/**
 * Map a raw API verse object to our internal Verse type.
 */
function mapVerse(v: Record<string, unknown>): Verse {
  const number = Number(v.verse_number ?? 0);
  const text = String(v.text_uthmani ?? v.text ?? '');
  const verseKey = String(v.verse_key ?? '');

  // Map words — filter to actual words only (exclude end markers, sajda, etc.)
  const rawWords: Record<string, unknown>[] = Array.isArray(v.words) ? v.words : [];
  const words: Word[] = rawWords
    .filter((w) => {
      const charType = String(w.char_type_name ?? 'word');
      return charType === 'word';
    })
    .map((w) => ({
      position: Number(w.position ?? 0),
      text: String(w.text ?? ''),
      transliteration: String((w.transliteration as Record<string, unknown>)?.text ?? ''),
      translation: String((w.translation as Record<string, unknown>)?.text ?? ''),
      audio_url: w.audio_url ? resolveAudioUrl(String(w.audio_url)) : undefined,
      char_type_name: 'word',
    }));

  // Map translations
  const rawTranslations: Record<string, unknown>[] = Array.isArray(v.translations) ? v.translations : [];
  const translations = rawTranslations.map((t) => ({
    text: String(t.text ?? ''),
    language: 'en',
  }));

  // Map audio
  const rawAudio = v.audio as Record<string, unknown> | undefined;
  const audioUrl = rawAudio?.url ? resolveAudioUrl(String(rawAudio.url)) : undefined;

  return {
    number,
    text,
    verse_key: verseKey,
    words: words.length > 0 ? words : undefined,
    translations: translations.length > 0 ? translations : undefined,
    audio: audioUrl ? { url: audioUrl } : undefined,
  };
}

/**
 * Ensure audio URLs are absolute. If the API returns a relative path,
 * prepend the audio CDN base URL.
 */
function resolveAudioUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Strip leading slash for clean concatenation
  const path = url.startsWith('/') ? url.slice(1) : url;
  return `${AUDIO_CDN}${path}`;
}
