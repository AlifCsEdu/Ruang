import { atom } from 'nanostores';
import type { SolatDay, SolatResponse } from '../lib/solat/types';

export const $solatZone = atom<string>('SGR01');
export const $solatToday = atom<SolatDay | null>(null);
export const $solatData = atom<SolatResponse | null>(null);
export const $solatLoading = atom<boolean>(false);
export const $solatError = atom<string | null>(null);
