import type { APIRoute } from 'astro';
import type { Verse, Word } from '../../../lib/quran/types';
import { SURAHS } from '../../../lib/quran/surahs';
import { VERSES_PER_PAGE, SHORT_SURAH_THRESHOLD, TRANSLATIONS } from '../../../lib/quran/constants';
import { checkRateLimit, rateLimitResponse } from '../../../lib/rateLimit';

export const prerender = false;

// Audio CDN base URL — prepend to relative audio paths from the API
const AUDIO_CDN = 'https://verses.quran.com/';

export const GET: APIRoute = async ({ params, url, request }) => {
  // Rate limit: 60 requests per minute per IP
  const rl = await checkRateLimit(request);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

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

  // Query params: reciter, translation, page, perPage, script
  const reciter = parseInt(url.searchParams.get('reciter') ?? '7', 10);
  const rawTranslation = parseInt(url.searchParams.get('translation') ?? '20', 10);
  // Validate translation ID against known translations; fall back to Sahih International
  const translation = TRANSLATIONS.some(t => t.id === rawTranslation) ? rawTranslation : 20;
  const requestedPage = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(300, Math.max(1, parseInt(url.searchParams.get('perPage') ?? String(VERSES_PER_PAGE), 10)));
  const script = url.searchParams.get('script') ?? 'uthmani';

  // Short surahs: load all verses, no pagination
  const isShort = surah.versesCount <= SHORT_SURAH_THRESHOLD;
  const effectivePerPage = isShort ? surah.versesCount : perPage;
  const effectivePage = isShort ? 1 : requestedPage;

  try {
    const { verses, totalPages } = await fetchPage(chapterNum, effectivePage, effectivePerPage, reciter, translation, script);

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
 * Build the fields parameter based on script type.
 */
function getFieldsForScript(script: string): string {
  switch (script) {
    case 'indopak': return 'text_uthmani,text_indopak';
    case 'tajweed': return 'text_uthmani,text_uthmani_tajweed';
    default: return 'text_uthmani';
  }
}

/**
 * Fetch a single page of verses with configurable reciter, translation, and script.
 */
async function fetchPage(
  chapterNum: number,
  page: number,
  perPage: number,
  reciter: number,
  translation: number,
  script: string,
): Promise<{ verses: Verse[]; totalPages: number }> {
  const fields = getFieldsForScript(script);
  const versesUrl = `https://api.qurancdn.com/api/qdc/verses/by_chapter/${chapterNum}` +
    `?language=en&words=true&translations=${translation}&audio=${reciter}` +
    `&fields=${fields}&per_page=${perPage}&page=${page}`;

  // Fetch verse data and recitation audio in parallel
  const [versesRes, audioMap] = await Promise.all([
    fetch(versesUrl),
    fetchRecitationAudio(chapterNum, reciter),
  ]);

  if (!versesRes.ok) {
    throw new Error(`Quran API returned ${versesRes.status}`);
  }

  const data = await versesRes.json();
  const pagination = data.pagination ?? {};
  const totalPages = pagination.total_pages ?? 1;

  const rawVerses: unknown[] = data.verses ?? [];
  const verses: Verse[] = rawVerses.map((raw) => mapVerse(raw as Record<string, unknown>, audioMap));

  return { verses, totalPages };
}

/**
 * Parse tajweed HTML from the API response.
 * Replaces <tajweed class=X> with <span class="tajweed-X">.
 */
function parseTajweedHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/<tajweed class=(\w+)>/g, '<span class="tajweed-$1">')
    .replace(/<\/tajweed>/g, '</span>')
    .replace(/<span class=end>/g, '<span class="verse-end">');
}

/**
 * Fetch verse-level recitation audio URLs from Quran.com API v4.
 * Returns a map from verse_key (e.g. "112:1") to resolved audio URL.
 * The QuranCDN verses endpoint only provides word-level audio;
 * verse-level recitation requires the separate recitations endpoint.
 * Falls back to alternative recitation resource IDs for reciters
 * whose primary ID may not have complete coverage.
 */
async function fetchRecitationAudio(chapterNum: number, reciter: number): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  // Primary endpoint
  const primaryUrl = `https://api.quran.com/api/v4/recitations/${reciter}/by_chapter/${chapterNum}`;
  const result = await tryFetchAudio(primaryUrl, map);
  if (result) return map;

  // Fallback: try alternative resource IDs for known reciters with incomplete coverage
  const fallbacks = getReciterFallbacks(reciter);
  for (const fallbackId of fallbacks) {
    const fallbackUrl = `https://api.quran.com/api/v4/recitations/${fallbackId}/by_chapter/${chapterNum}`;
    const ok = await tryFetchAudio(fallbackUrl, map);
    if (ok) return map;
  }

  return map;
}

/**
 * Try fetching audio from a single URL into the provided map.
 * Returns true if successful and the map has entries.
 */
async function tryFetchAudio(url: string, map: Map<string, string>): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return false;
    const data = await res.json();
    const audioFiles: Record<string, unknown>[] = Array.isArray(data.audio_files) ? data.audio_files : [];
    if (audioFiles.length === 0) return false;
    for (const file of audioFiles) {
      const verseKey = file.verse_key as string;
      const fileUrl = file.url as string;
      if (verseKey && fileUrl) {
        map.set(verseKey, resolveAudioUrl(fileUrl));
      }
    }
    return map.size > 0;
  } catch {
    return false;
  }
}

/**
 * Get fallback recitation IDs for reciters that may have incomplete coverage.
 * Maps from primary reciter ID to alternative IDs that serve the same reciter
 * or a very similar recitation style.
 */
function getReciterFallbacks(reciter: number): number[] {
  const fallbackMap: Record<number, number[]> = {
    // Saad Al-Ghamdi — try alternative segment-based recitation
    12: [13],
    // Add more fallbacks as needed
  };
  return fallbackMap[reciter] ?? [];
}

/**
 * Map a raw API verse object to our internal Verse type.
 */
function mapVerse(v: Record<string, unknown>, audioMap?: Map<string, string>): Verse {
  const number = Number(v.verse_number ?? 0);
  const text = String(v.text_uthmani ?? v.text ?? '');
  const textIndopak = v.text_indopak ? String(v.text_indopak) : undefined;
  const textTajweed = v.text_uthmani_tajweed ? parseTajweedHtml(String(v.text_uthmani_tajweed)) : undefined;
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

  // Map translations — filter out empty ones
  const rawTranslations: Record<string, unknown>[] = Array.isArray(v.translations) ? v.translations : [];
  const translations = rawTranslations
    .map((t) => ({
      text: String(t.text ?? '').trim(),
      language: String(t.language_name ?? 'en'),
      resource_name: String(t.resource_name ?? ''),
    }))
    .filter((t) => t.text.length > 0);

  // Map audio — check multiple possible field structures from QuranCDN,
  // then fall back to recitation endpoint audio map
  const rawAudio = v.audio as Record<string, unknown> | undefined;
  let audioUrl: string | undefined;
  if (rawAudio) {
    const urlStr = rawAudio.url
      ?? rawAudio.secondary   // may be a plain string URL
      ?? rawAudio.primary;    // may be a plain string URL
    if (urlStr) audioUrl = resolveAudioUrl(String(urlStr));
  }
  // Fallback: use verse-level audio from recitations endpoint
  if (!audioUrl && audioMap && verseKey) {
    audioUrl = audioMap.get(verseKey);
  }

  return {
    number,
    text,
    text_indopak: textIndopak,
    text_tajweed: textTajweed,
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
