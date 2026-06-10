import type { APIRoute } from 'astro';

export const prerender = false;

// Hadith collections available from Sunnah.com API
const COLLECTIONS = [
  { name: 'bukhari', title: 'Sahih al-Bukhari', arabicTitle: 'صحيح البخاري', hadithCount: 7563, description: 'The most authentic collection of hadith compiled by Imam Bukhari' },
  { name: 'muslim', title: 'Sahih Muslim', arabicTitle: 'صحيح مسلم', hadithCount: 7500, description: 'Second most authentic collection compiled by Imam Muslim' },
  { name: 'abudawud', title: "Sunan Abu Dawud", arabicTitle: 'سنن أبي داود', hadithCount: 5274, description: 'One of the six major collections compiled by Abu Dawud' },
  { name: 'tirmidhi', title: "Jami' at-Tirmidhi", arabicTitle: 'جامع الترمذي', hadithCount: 3956, description: 'One of the six major collections compiled by Imam Tirmidhi' },
  { name: 'nasai', title: "Sunan an-Nasa'i", arabicTitle: 'سنن النسائي', hadithCount: 5758, description: 'One of the six major collections compiled by Imam Nasa\'i' },
  { name: 'ibnmajah', title: 'Sunan Ibn Majah', arabicTitle: 'سنن ابن ماجه', hadithCount: 4341, description: 'One of the six major collections compiled by Ibn Majah' },
  { name: 'malik', title: 'Muwatta Malik', arabicTitle: 'موطأ مالك', hadithCount: 1594, description: 'The earliest collection compiled by Imam Malik' },
];

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ collections: COLLECTIONS }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
    },
  });
};
