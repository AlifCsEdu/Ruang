/**
 * Quran reader configuration constants.
 * Reciters, translations, and Juz data from Quran.com API v4.
 */

import type { ScriptType, WordBelowDisplay } from './types';

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
  { id: 7, name: 'Mishary Rashid Alafasy', arabicName: 'مشاري راشد العفاسي', style: 'Murattal' },
  { id: 1, name: 'Abdul Basit (Murattal)', arabicName: 'عبد الباسط عبد الصمد', style: 'Murattal' },
  { id: 3, name: 'Abdul Rahman Al-Sudais', arabicName: 'عبد الرحمن السديس' },
  { id: 4, name: 'Abu Bakr Al-Shatri', arabicName: 'أبو بكر الشاطري' },
  { id: 5, name: 'Hani Ar-Rifai', arabicName: 'هاني الرفاعي' },
  { id: 8, name: 'Maher Al-Muaiqly', arabicName: 'ماهر المعيقلي' },
  { id: 9, name: 'Mahmoud Khalil Al-Husary', arabicName: 'محمود خليل الحصري' },
  { id: 10, name: 'Mohamed Siddiq Al-Minshawi', arabicName: 'محمد صديق المنشاوي', style: 'Mujawwad' },
  { id: 12, name: 'Saad Al-Ghamdi', arabicName: 'سعد الغامدي' },
  { id: 161, name: 'Yasser Al-Dosari', arabicName: 'ياسر الدوسري' },
  { id: 168, name: 'Ahmad Al-Ajmi', arabicName: 'أحمد العجمي' },
];

export const TRANSLATIONS: Translation[] = [
  { id: 20, name: 'Sahih International', language: 'en' },
  { id: 22, name: 'A. Yusuf Ali', language: 'en' },
  { id: 39, name: 'Abdullah Muhammad Basmeih', language: 'ms' },
];

/** Number of verses per page for paginated mode. */
export const VERSES_PER_PAGE = 50;

/** Surahs with ≤ this many verses will be loaded entirely. */
export const SHORT_SURAH_THRESHOLD = 50;

/** Font size controls (rem units) */
export const FONT_SIZE_MIN = 1.25;
export const FONT_SIZE_MAX = 3.5;
export const FONT_SIZE_DEFAULT = 1.75;
export const FONT_SIZE_STEP = 0.25;

/** Playback speed options */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/** Script/font style options */
export const SCRIPT_TYPES: { id: ScriptType; name: string; description: string }[] = [
  { id: 'uthmani', name: 'Uthmani', description: 'Standard script with full diacritics' },
  { id: 'indopak', name: 'IndoPak', description: 'Popular in South & Southeast Asia' },
  { id: 'tajweed', name: 'Tajweed', description: 'Color-coded pronunciation rules' },
];

/** Word-by-word below-word display options */
export const WORD_BELOW_OPTIONS: { id: WordBelowDisplay; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'translation', label: 'Terjemahan' },
  { id: 'transliteration', label: 'Rumi' },
  { id: 'both', label: 'Both' },
];

/** localStorage keys */
export const LS_FONT_SIZE = 'ruang_quran_font_size';
export const LS_SCRIPT_TYPE = 'ruang_quran_script_type';
export const LS_WORD_BELOW = 'ruang_quran_word_below';
export const LS_DISPLAY_MODE = 'ruang_quran_display_mode';
export const LS_AUDIO_PREFS = 'ruang_quran_audio_prefs';
export const LS_NIGHT_MODE = 'ruang_quran_night_mode';

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
