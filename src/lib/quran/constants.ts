/**
 * Quran reader configuration constants.
 * Reciters, translations, and Juz data from Quran.com API v4.
 */

export interface Reciter {
  id: number;
  name: string;
  arabicName: string;
  style?: string;
}

export interface Translation {
  id: number;
  name: string;
  language: string;
}

export const RECITERS: Reciter[] = [
  { id: 7, name: 'Mishary Rashid Alafasy', arabicName: 'مشاري راشد العفاسي' },
  { id: 1, name: 'Abdul Basit (Murattal)', arabicName: 'عبد الباسط عبد الصمد', style: 'Murattal' },
  { id: 3, name: 'Abdul Rahman Al-Sudais', arabicName: 'عبد الرحمن السديس' },
  { id: 4, name: 'Abu Bakr Al-Shatri', arabicName: 'أبو بكر الشاطري' },
];

export const TRANSLATIONS: Translation[] = [
  { id: 131, name: 'Dr. Mustafa Khattab (The Clear Quran)', language: 'en' },
  { id: 20, name: 'Sahih International', language: 'en' },
  { id: 174, name: 'Abdullah Muhammad Basmeih', language: 'ms' },
];

/** Number of verses per page for paginated mode. */
export const VERSES_PER_PAGE = 50;

/** Surahs with ≤ this many verses will be loaded entirely. */
export const SHORT_SURAH_THRESHOLD = 50;

/** Juz data: start surah and ayah for each of 30 Juz. */
export const JUZ_DATA = [
  { juz: 1, startSurah: 1, startAyah: 1 },
  { juz: 2, startSurah: 2, startAyah: 142 },
  { juz: 3, startSurah: 2, startAyah: 253 },
  { juz: 4, startSurah: 3, startAyah: 93 },
  { juz: 5, startSurah: 4, startAyah: 24 },
  { juz: 6, startSurah: 4, startAyah: 148 },
  { juz: 7, startSurah: 5, startAyah: 82 },
  { juz: 8, startSurah: 6, startAyah: 111 },
  { juz: 9, startSurah: 7, startAyah: 88 },
  { juz: 10, startSurah: 8, startAyah: 41 },
  { juz: 11, startSurah: 9, startAyah: 93 },
  { juz: 12, startSurah: 11, startAyah: 6 },
  { juz: 13, startSurah: 12, startAyah: 53 },
  { juz: 14, startSurah: 15, startAyah: 1 },
  { juz: 15, startSurah: 17, startAyah: 1 },
  { juz: 16, startSurah: 18, startAyah: 75 },
  { juz: 17, startSurah: 21, startAyah: 1 },
  { juz: 18, startSurah: 23, startAyah: 1 },
  { juz: 19, startSurah: 25, startAyah: 21 },
  { juz: 20, startSurah: 27, startAyah: 56 },
  { juz: 21, startSurah: 29, startAyah: 46 },
  { juz: 22, startSurah: 33, startAyah: 31 },
  { juz: 23, startSurah: 36, startAyah: 28 },
  { juz: 24, startSurah: 39, startAyah: 32 },
  { juz: 25, startSurah: 41, startAyah: 47 },
  { juz: 26, startSurah: 46, startAyah: 1 },
  { juz: 27, startSurah: 51, startAyah: 31 },
  { juz: 28, startSurah: 58, startAyah: 1 },
  { juz: 29, startSurah: 67, startAyah: 1 },
  { juz: 30, startSurah: 78, startAyah: 1 },
];
