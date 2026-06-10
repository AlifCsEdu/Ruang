export interface Hadith {
  number: number;
  arabic: string;
  english: string;
  narrator?: string;
  reference?: string;
  grade?: string;
}

export interface HadithCollection {
  name: string;
  title: string;
  arabicTitle: string;
  hadithCount: number;
  description: string;
}

export interface HadithResponse {
  collection: string;
  hadiths: Hadith[];
  totalHadiths: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
}
