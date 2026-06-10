/**
 * Quran bookmarks — localStorage CRUD for verse bookmarks and last-read position.
 */

const BOOKMARKS_KEY = 'ruang_quran_bookmarks';
const LAST_READ_KEY = 'ruang_quran_last_read';

export interface Bookmark {
  surah: number;
  ayah: number;
  surahName: string;
  addedAt: number;
  note?: string;
}

export interface LastRead {
  surah: number;
  ayah: number;
  surahName: string;
  savedAt: number;
}

/** Get all bookmarks. */
export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Bookmark[];
  } catch {
    return [];
  }
}

/** Add a bookmark. */
export function addBookmark(b: Omit<Bookmark, 'addedAt'>): void {
  const bookmarks = getBookmarks();
  // Avoid duplicates
  const exists = bookmarks.find((x) => x.surah === b.surah && x.ayah === b.ayah);
  if (exists) return;

  bookmarks.push({ ...b, addedAt: Date.now() });
  bookmarks.sort((a, b) => b.addedAt - a.addedAt); // newest first

  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {}
}

/** Remove a bookmark. */
export function removeBookmark(surah: number, ayah: number): void {
  const bookmarks = getBookmarks().filter((b) => !(b.surah === surah && b.ayah === ayah));
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {}
}

/** Check if a verse is bookmarked. */
export function isBookmarked(surah: number, ayah: number): boolean {
  return getBookmarks().some((b) => b.surah === surah && b.ayah === ayah);
}

/** Toggle bookmark on/off. Returns true if added, false if removed. */
export function toggleBookmark(surah: number, ayah: number, surahName: string): boolean {
  if (isBookmarked(surah, ayah)) {
    removeBookmark(surah, ayah);
    return false;
  } else {
    addBookmark({ surah, ayah, surahName });
    return true;
  }
}

/** Save last read position. */
export function saveLastRead(surah: number, ayah: number, surahName: string): void {
  const data: LastRead = { surah, ayah, surahName, savedAt: Date.now() };
  try {
    localStorage.setItem(LAST_READ_KEY, JSON.stringify(data));
  } catch {}
}

/** Get last read position. */
export function getLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastRead;
  } catch {
    return null;
  }
}
