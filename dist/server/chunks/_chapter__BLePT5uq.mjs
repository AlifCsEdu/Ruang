globalThis.process ??= {};
globalThis.process.env ??= {};
import { S as SURAHS } from "./surahs_C-icQo2j.mjs";
const VERSES_PER_PAGE = 50;
const SHORT_SURAH_THRESHOLD = 50;
const prerender = false;
const AUDIO_CDN = "https://verses.quran.com/";
const GET = async ({ params, url }) => {
  const chapterNum = Number(params.chapter);
  if (!chapterNum || chapterNum < 1 || chapterNum > 114) {
    return new Response(JSON.stringify({ error: "Invalid chapter number" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const surah = SURAHS.find((s) => s.number === chapterNum);
  if (!surah) {
    return new Response(JSON.stringify({ error: "Chapter not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  const reciter = parseInt(url.searchParams.get("reciter") ?? "7", 10);
  const translation = parseInt(url.searchParams.get("translation") ?? "131", 10);
  const requestedPage = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(300, Math.max(1, parseInt(url.searchParams.get("perPage") ?? String(VERSES_PER_PAGE), 10)));
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
        isShortSurah: isShort
      }
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400"
      }
    });
  } catch (err) {
    const status = err.message.includes("429") ? 429 : 502;
    return new Response(JSON.stringify({ error: "Failed to fetch chapter" }), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }
};
async function fetchPage(chapterNum, page2, perPage, reciter, translation) {
  const url = `https://api.qurancdn.com/api/qdc/verses/by_chapter/${chapterNum}?language=en&words=true&translations=${translation}&audio=${reciter}&fields=text_uthmani&per_page=${perPage}&page=${page2}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Quran API returned ${res.status}`);
  }
  const data = await res.json();
  const pagination = data.pagination ?? {};
  const totalPages = pagination.total_pages ?? 1;
  const rawVerses = data.verses ?? [];
  const verses = rawVerses.map((raw) => mapVerse(raw));
  return { verses, totalPages };
}
function mapVerse(v) {
  const number = Number(v.verse_number ?? 0);
  const text = String(v.text_uthmani ?? v.text ?? "");
  const verseKey = String(v.verse_key ?? "");
  const rawWords = Array.isArray(v.words) ? v.words : [];
  const words = rawWords.filter((w) => {
    const charType = String(w.char_type_name ?? "word");
    return charType === "word";
  }).map((w) => ({
    position: Number(w.position ?? 0),
    text: String(w.text ?? ""),
    transliteration: String(w.transliteration?.text ?? ""),
    translation: String(w.translation?.text ?? ""),
    audio_url: w.audio_url ? resolveAudioUrl(String(w.audio_url)) : void 0,
    char_type_name: "word"
  }));
  const rawTranslations = Array.isArray(v.translations) ? v.translations : [];
  const translations = rawTranslations.map((t) => ({
    text: String(t.text ?? ""),
    language: "en"
  }));
  const rawAudio = v.audio;
  const audioUrl = rawAudio?.url ? resolveAudioUrl(String(rawAudio.url)) : void 0;
  return {
    number,
    text,
    verse_key: verseKey,
    words: words.length > 0 ? words : void 0,
    translations: translations.length > 0 ? translations : void 0,
    audio: audioUrl ? { url: audioUrl } : void 0
  };
}
function resolveAudioUrl(url) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url.slice(1) : url;
  return `${AUDIO_CDN}${path}`;
}
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
