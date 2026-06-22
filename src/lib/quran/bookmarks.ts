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
  tags?: string[];
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

/** Update a bookmark's note. */
export function updateBookmarkNote(surah: number, ayah: number, note: string): void {
  const bookmarks = getBookmarks();
  const idx = bookmarks.findIndex((b) => b.surah === surah && b.ayah === ayah);
  if (idx === -1) return;
  bookmarks[idx] = { ...bookmarks[idx], note: note || undefined };
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {}
}

/** Clear all bookmarks. */
export function clearAllBookmarks(): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
  } catch {}
}

/** Get bookmark count. */
export function getBookmarkCount(): number {
  return getBookmarks().length;
}

/** Add a tag to a bookmark. */
export function addTagToBookmark(surah: number, ayah: number, tag: string): void {
  const bookmarks = getBookmarks();
  const idx = bookmarks.findIndex((b) => b.surah === surah && b.ayah === ayah);
  if (idx === -1) return;
  if (!bookmarks[idx].tags) bookmarks[idx].tags = [];
  if (!bookmarks[idx].tags!.includes(tag)) {
    bookmarks[idx].tags!.push(tag);
  }
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {}
}

/** Remove a tag from a bookmark. */
export function removeTagFromBookmark(surah: number, ayah: number, tag: string): void {
  const bookmarks = getBookmarks();
  const idx = bookmarks.findIndex((b) => b.surah === surah && b.ayah === ayah);
  if (idx === -1) return;
  bookmarks[idx].tags = bookmarks[idx].tags?.filter((t) => t !== tag);
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch {}
}

/** Get all unique tags across bookmarks. */
export function getAllTags(): string[] {
  const bookmarks = getBookmarks();
  const tags = new Set<string>();
  bookmarks.forEach((b) => b.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

/** Get bookmarks filtered by tag. */
export function getBookmarksByTag(tag: string): Bookmark[] {
  return getBookmarks().filter((b) => b.tags?.includes(tag));
}

// === Reading Progress ===

const PROGRESS_KEY = 'ruang_quran_progress';

export interface ReadingProgress {
  surah: number;
  surahName: string;
  lastVerse: number;
  totalVerses: number;
  percentage: number;
  updatedAt: number;
}

/** Save reading progress for a surah. */
export function saveReadingProgress(surah: number, surahName: string, lastVerse: number, totalVerses: number): void {
  const progress = getAllProgress();
  const idx = progress.findIndex(p => p.surah === surah);
  const entry: ReadingProgress = {
    surah, surahName, lastVerse, totalVerses,
    percentage: Math.round((lastVerse / totalVerses) * 100),
    updatedAt: Date.now(),
  };
  if (idx >= 0) {
    progress[idx] = entry;
  } else {
    progress.push(entry);
  }
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}

/** Get all reading progress entries. */
export function getAllProgress(): ReadingProgress[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/** Get reading progress for a specific surah. */
export function getProgressForSurah(surah: number): ReadingProgress | null {
  return getAllProgress().find(p => p.surah === surah) ?? null;
}
