// Shared navigation data — single source of truth for Navbar, Sidebar, BottomNav
import {
  HomeIcon,
  MosqueIcon,
  BookIcon,
  ScrollIcon,
  HandsIcon,
  BeadsIcon,
  CheckCircleIcon,
  CalendarIcon,
} from '../icons/index';

export interface NavLink {
  href: string;
  label: string;
  icon: (size?: number) => string;
  color: string; // Tailwind bg class for card tinting
}

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Dashboard', icon: HomeIcon, color: 'bg-canvas' },
  { href: '/solat', label: 'Waktu Solat', icon: MosqueIcon, color: 'bg-accent-blue/10' },
  { href: '/quran', label: 'Al-Quran', icon: BookIcon, color: 'bg-accent-green/10' },
  { href: '/duas', label: 'Duas', icon: HandsIcon, color: 'bg-accent-pink/10' },
  { href: '/hadith', label: 'Hadith', icon: ScrollIcon, color: 'bg-accent-yellow/20' },
  { href: '/tasbih', label: 'Tasbih', icon: BeadsIcon, color: 'bg-accent-blue/10' },
  { href: '/tracker', label: 'Tracker', icon: CheckCircleIcon, color: 'bg-accent-green/10' },
  { href: '/hijri', label: 'Calendar', icon: CalendarIcon, color: 'bg-accent-yellow/20' },
];

// Bottom nav shows a subset (most-used + home)
export const BOTTOM_NAV_LINKS: NavLink[] = [
  NAV_LINKS[1], // Solat
  NAV_LINKS[2], // Quran
  NAV_LINKS[5], // Tasbih
  NAV_LINKS[6], // Tracker
  NAV_LINKS[0], // Home
];

export function isActive(currentPath: string, linkHref: string): boolean {
  if (linkHref === '/') return currentPath === '/';
  return currentPath.startsWith(linkHref);
}
