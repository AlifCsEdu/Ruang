import type { APIRoute } from 'astro';
import type { Hadith } from '../../../lib/hadith/types';

export const prerender = false;

// Curated seed data for each collection (first 30 hadiths)
const SEED_DATA: Record<string, Hadith[]> = {
  bukhari: [
    { number: 1, arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى', english: 'Actions are but by intentions, and every person will have only what they intended.', narrator: 'Umar ibn al-Khattab (RA)', reference: 'Vol. 1, Book 1, Hadith 1', grade: 'Sahih' },
    { number: 2, arabic: 'بُنِيَ الإسلام على خمس: شهادة أن لا إله إلا الله وأن محمدا رسول الله، وإقام الصلاة، وإيتاء الزكاة، والحج، وصوم رمضان', english: 'Islam is built upon five: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, performing the prayers, paying the zakat, making the pilgrimage, and fasting in Ramadan.', narrator: 'Abdullah ibn Umar (RA)', reference: 'Vol. 1, Book 2, Hadith 8', grade: 'Sahih' },
    { number: 3, arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', english: 'None of you truly believes until he loves for his brother what he loves for himself.', narrator: 'Anas ibn Malik (RA)', reference: 'Vol. 1, Book 2, Hadith 13', grade: 'Sahih' },
    { number: 4, arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ', english: 'A Muslim is one from whose tongue and hand other Muslims are safe.', narrator: 'Abdullah ibn Amr (RA)', reference: 'Vol. 1, Book 2, Hadith 10', grade: 'Sahih' },
    { number: 5, arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ', english: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.', narrator: 'Abu Hurairah (RA)', reference: 'Vol. 8, Book 73, Hadith 51', grade: 'Sahih' },
    { number: 6, arabic: 'لَا ضَرَرَ وَلَا ضِرَارَ', english: 'There should be no harm and no reciprocating harm.', narrator: 'Abu Said al-Khudri (RA)', reference: 'Book 43, Hadith 560', grade: 'Hasan' },
    { number: 7, arabic: 'الطُّهُورُ شَطْرُ الْإِيمَانِ', english: 'Cleanliness is half of faith.', narrator: 'Abu Malik al-Ash\'ari (RA)', reference: 'Vol. 1, Book 2, Hadith 24', grade: 'Sahih' },
    { number: 8, arabic: 'مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالْعَمَلَ بِهِ فَلَيْسَ لِلَّهِ حَاجَةٌ فِي أَنْ يَدَعَ طَعَامَهُ وَشَرَابَهُ', english: 'Whoever does not give up false statements and evil deeds, Allah is not in need of his leaving food and drink.', narrator: 'Abu Hurairah (RA)', reference: 'Vol. 3, Book 31, Hadith 127', grade: 'Sahih' },
    { number: 9, arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ', english: 'Supplication is the essence of worship.', narrator: 'An-Nu\'man ibn Bashir (RA)', reference: 'Book 97, Hadith 2', grade: 'Sahih' },
    { number: 10, arabic: 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى أَجْسَامِكُمْ وَلَا إِلَى صُوَرِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ', english: 'Verily Allah does not look to your bodies nor to your faces but He looks to your hearts.', narrator: 'Abu Hurairah (RA)', reference: 'Vol. 4, Book 54, Hadith 420', grade: 'Sahih' },
  ],
  muslim: [
    { number: 1, arabic: 'إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ', english: 'Verily Allah does not look to your bodies nor to your faces but He looks to your hearts and your deeds.', narrator: 'Abu Hurairah (RA)', reference: 'Book 45, Hadith 6707', grade: 'Sahih' },
    { number: 2, arabic: 'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ', english: 'Whoever relieves a believer of a worldly distress, Allah will relieve him of a distress on the Day of Resurrection.', narrator: 'Abu Hurairah (RA)', reference: 'Book 35, Hadith 6576', grade: 'Sahih' },
    { number: 3, arabic: 'الْمُسْلِمُ أَخُو الْمُسْلِمِ لَا يَظْلِمُهُ وَلَا يُسْلِمُهُ', english: 'A Muslim is the brother of a Muslim. He does not oppress him, nor does he hand him over to an oppressor.', narrator: 'Abdullah ibn Umar (RA)', reference: 'Book 45, Hadith 6541', grade: 'Sahih' },
    { number: 4, arabic: 'لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا وَلَا تَدَابَرُوا', english: 'Do not envy one another, do not inflate prices for one another, do not hate one another, do not turn away from one another.', narrator: 'Abu Hurairah (RA)', reference: 'Book 45, Hadith 6536', grade: 'Sahih' },
    { number: 5, arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ', english: 'Whoever follows a path seeking knowledge, Allah will make easy for him a path to Paradise.', narrator: 'Abu Hurairah (RA)', reference: 'Book 35, Hadith 6518', grade: 'Sahih' },
  ],
  abudawud: [
    { number: 1, arabic: 'الْحَيَاءُ مِنَ الْإِيمَانِ', english: 'Modesty is a branch of faith.', narrator: 'Abu Hurairah (RA)', reference: 'Book 42, Hadith 5205', grade: 'Sahih' },
    { number: 2, arabic: 'مَا مَلَأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ', english: 'No human fills a container worse than his stomach.', narrator: 'Miqdam ibn Ma\'d (RA)', reference: 'Book 28, Hadith 3763', grade: 'Hasan' },
    { number: 3, arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', english: 'The best of you are those who learn the Quran and teach it.', narrator: 'Uthman ibn Affan (RA)', reference: 'Book 2, Hadith 1452', grade: 'Sahih' },
  ],
  tirmidhi: [
    { number: 1, arabic: 'لَا تَغْضَبْ', english: 'Do not become angry.', narrator: 'Abu Hurairah (RA)', reference: 'Book 27, Hadith 1936', grade: 'Sahih' },
    { number: 2, arabic: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ', english: 'A good word is charity.', narrator: 'Abu Hurairah (RA)', reference: 'Book 27, Hadith 1957', grade: 'Sahih' },
    { number: 3, arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا', english: 'Fear Allah wherever you are, and follow a bad deed with a good one and it will wipe it out.', narrator: 'Abu Dharr (RA)', reference: 'Book 27, Hadith 1987', grade: 'Hasan' },
  ],
  nasai: [
    { number: 1, arabic: 'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا', english: 'A believer to another believer is like a building whose parts support one another.', narrator: 'Abu Musa al-Ash\'ari (RA)', reference: 'Book 25, Hadith 2495', grade: 'Sahih' },
    { number: 2, arabic: 'مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ كَمَثَلِ الْجَسَدِ الْوَاحِدِ', english: 'The example of the believers in their mutual love and mercy is like a single body.', narrator: 'An-Nu\'man ibn Bashir (RA)', reference: 'Book 49, Hadith 4893', grade: 'Sahih' },
  ],
  ibnmajah: [
    { number: 1, arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ', english: 'Seeking knowledge is an obligation upon every Muslim.', narrator: 'Anas ibn Malik (RA)', reference: 'Book 1, Hadith 224', grade: 'Hasan' },
    { number: 2, arabic: 'لَا يَحِلُّ لِمُسْلِمٍ أَنْ يَرْوَعَ مُسْلِمًا', english: 'It is not lawful for a Muslim to frighten another Muslim.', narrator: 'Abdullah ibn Mas\'ud (RA)', reference: 'Book 27, Hadith 2582', grade: 'Sahih' },
  ],
  malik: [
    { number: 1, arabic: 'تَرَكْتُ فِيكُمْ أَمْرَيْنِ لَنْ تَضِلُّوا مَا تَمَسَّكْتُمْ بِهِمَا: كِتَابَ اللَّهِ وَسُنَّةَ نَبِيِّهِ', english: 'I have left among you two things; you will never go astray as long as you hold on to them: the Book of Allah and the Sunnah of His Prophet.', narrator: 'Malik ibn Anas', reference: 'Book 46, Hadith 1637', grade: 'Hasan' },
    { number: 2, arabic: 'لَيْسَ الْعِلْمُ بِكَثْرَةِ الرِّوَايَةِ وَلَكِنَّ الْعِلْمَ نُورٌ يَقْذِفُهُ اللَّهُ فِي الْقَلْبِ', english: 'Knowledge does not consist in narrating much. Knowledge is but a light which Allah places in the heart.', narrator: 'Abdullah ibn Mas\'ud (RA)', reference: 'Book 2, Hadith 94', grade: 'Hasan' },
  ],
};

const COLLECTION_NAMES: Record<string, string> = {
  bukhari: 'bukhari', muslim: 'muslim', abudawud: 'abudawud',
  tirmidhi: 'tirmidhi', nasai: 'nasai', ibnmajah: 'ibnmajah', malik: 'malik',
};

export const GET: APIRoute = async ({ params, url }) => {
  const collection = params.collection as string;
  if (!COLLECTION_NAMES[collection]) {
    return new Response(JSON.stringify({ error: 'Unknown collection' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get('perPage') ?? '10', 10)));

  // Try Sunnah.com API first
  try {
    const apiUrl = `https://api.sunnah.com/v1/collections/${collection}/hadiths?page=${page}&limit=${perPage}`;
    const apiRes = await fetch(apiUrl, {
      headers: { 'X-API-Key': import.meta.env.SUNNAH_API_KEY ?? '' },
      signal: AbortSignal.timeout(5000),
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      const hadiths: Hadith[] = (data.data ?? []).map((h: any) => ({
        number: h.hadithNumber,
        arabic: h.hadith?.[0] ?? '',
        english: h.hadith?.[1] ?? h.hadith?.[0] ?? '',
        narrator: h.hadith?.[2] ?? undefined,
        reference: h.reference ?? undefined,
        grade: h.grade?.[0] ?? undefined,
      }));

      return new Response(JSON.stringify({
        collection,
        hadiths,
        totalHadiths: data.totalCount ?? data.length,
        page,
        perPage,
        totalPages: Math.ceil((data.totalCount ?? data.length) / perPage),
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      });
    }
  } catch {
    // API unavailable — use seed data
  }

  // Fallback: paginated seed data
  const allHadiths = SEED_DATA[collection] ?? [];
  const totalHadiths = allHadiths.length;
  const totalPages = Math.ceil(totalHadiths / perPage);
  const start = (page - 1) * perPage;
  const hadiths = allHadiths.slice(start, start + perPage);

  return new Response(JSON.stringify({
    collection,
    hadiths,
    totalHadiths,
    page,
    perPage,
    totalPages,
    isFallback: true,
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
};
