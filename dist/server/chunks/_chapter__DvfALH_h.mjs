globalThis.process ??= {};
globalThis.process.env ??= {};
import { S as SURAHS } from "./surahs_C-icQo2j.mjs";
const TRANSLATIONS = [
  { id: 20, name: "Sahih International", language: "en" },
  { id: 22, name: "A. Yusuf Ali", language: "en" },
  { id: 39, name: "Abdullah Muhammad Basmeih", language: "ms" }
];
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
  const rawTranslation = parseInt(url.searchParams.get("translation") ?? "20", 10);
  const translation = TRANSLATIONS.some((t) => t.id === rawTranslation) ? rawTranslation : 20;
  const requestedPage = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const perPage = Math.min(300, Math.max(1, parseInt(url.searchParams.get("perPage") ?? String(VERSES_PER_PAGE), 10)));
  const script = url.searchParams.get("script") ?? "uthmani";
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
function getFieldsForScript(script) {
  switch (script) {
    case "indopak":
      return "text_uthmani,text_indopak";
    case "tajweed":
      return "text_uthmani,text_uthmani_tajweed";
    default:
      return "text_uthmani";
  }
}
async function fetchPage(chapterNum, page2, perPage, reciter, translation, script) {
  const fields = getFieldsForScript(script);
  const versesUrl = `https://api.qurancdn.com/api/qdc/verses/by_chapter/${chapterNum}?language=en&words=true&translations=${translation}&audio=${reciter}&fields=${fields}&per_page=${perPage}&page=${page2}`;
  const [versesRes, audioMap] = await Promise.all([
    fetch(versesUrl),
    fetchRecitationAudio(chapterNum, reciter)
  ]);
  if (!versesRes.ok) {
    throw new Error(`Quran API returned ${versesRes.status}`);
  }
  const data = await versesRes.json();
  const pagination = data.pagination ?? {};
  const totalPages = pagination.total_pages ?? 1;
  const rawVerses = data.verses ?? [];
  const verses = rawVerses.map((raw) => mapVerse(raw, audioMap));
  return { verses, totalPages };
}
function parseTajweedHtml(text) {
  if (!text) return "";
  return text.replace(/<tajweed class=(\w+)>/g, '<span class="tajweed-$1">').replace(/<\/tajweed>/g, "</span>").replace(/<span class=end>/g, '<span class="verse-end">');
}
async function fetchRecitationAudio(chapterNum, reciter) {
  const map = /* @__PURE__ */ new Map();
  const primaryUrl = `https://api.quran.com/api/v4/recitations/${reciter}/by_chapter/${chapterNum}`;
  const result = await tryFetchAudio(primaryUrl, map);
  if (result) return map;
  const fallbacks = getReciterFallbacks(reciter);
  for (const fallbackId of fallbacks) {
    const fallbackUrl = `https://api.quran.com/api/v4/recitations/${fallbackId}/by_chapter/${chapterNum}`;
    const ok = await tryFetchAudio(fallbackUrl, map);
    if (ok) return map;
  }
  return map;
}
async function tryFetchAudio(url, map) {
  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) return false;
    const data = await res.json();
    const audioFiles = Array.isArray(data.audio_files) ? data.audio_files : [];
    if (audioFiles.length === 0) return false;
    for (const file of audioFiles) {
      const verseKey = file.verse_key;
      const fileUrl = file.url;
      if (verseKey && fileUrl) {
        map.set(verseKey, resolveAudioUrl(fileUrl));
      }
    }
    return map.size > 0;
  } catch {
    return false;
  }
}
function getReciterFallbacks(reciter) {
  const fallbackMap = {
    // Saad Al-Ghamdi — try alternative segment-based recitation
    12: [13]
    // Add more fallbacks as needed
  };
  return fallbackMap[reciter] ?? [];
}
function mapVerse(v, audioMap) {
  const number = Number(v.verse_number ?? 0);
  const text = String(v.text_uthmani ?? v.text ?? "");
  const textIndopak = v.text_indopak ? String(v.text_indopak) : void 0;
  const textTajweed = v.text_uthmani_tajweed ? parseTajweedHtml(String(v.text_uthmani_tajweed)) : void 0;
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
    text: String(t.text ?? "").trim(),
    language: String(t.language_name ?? "en"),
    resource_name: String(t.resource_name ?? "")
  })).filter((t) => t.text.length > 0);
  const rawAudio = v.audio;
  let audioUrl;
  if (rawAudio) {
    const urlStr = rawAudio.url ?? rawAudio.secondary ?? rawAudio.primary;
    if (urlStr) audioUrl = resolveAudioUrl(String(urlStr));
  }
  if (!audioUrl && audioMap && verseKey) {
    audioUrl = audioMap.get(verseKey);
  }
  return {
    number,
    text,
    text_indopak: textIndopak,
    text_tajweed: textTajweed,
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
