export interface Surah {
  number: number;
  name: string;          // Arabic name
  englishName: string;   // Transliterated name
  englishMeaning: string;
  versesCount: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Verse {
  number: number;
  text: string;          // Arabic text (Uthmani)
  verse_key?: string;    // e.g. "1:1"
  translations?: {
    text: string;
    language: string;
  }[];
  words?: Word[];
  audio?: {
    url: string;         // Full URL to verse audio MP3
  };
}

export interface Word {
  position: number;
  text: string;          // Arabic word
  transliteration: string;
  translation: string;
  audio_url?: string;    // Word-level audio (relative path)
  char_type_name?: string; // 'word', 'end', 'sajda', etc.
}

export interface ChapterResponse {
  verses: Verse[];
  surah: Surah;
}

export type VerseDisplayMode = 'standard' | 'word-by-word';

export interface AudioState {
  playing: boolean;
  currentVerse: number;
  autoAdvance: boolean;
}
