globalThis.process ??= {};
globalThis.process.env ??= {};
const prerender = false;
const ZONES = [
  { id: "JHR01", name: "Pulau Aur, Pulau Pemanggil", state: "Johor", flag: "Johor" },
  { id: "JHR02", name: "Johor Bahru, Kota Tinggi, Mersing, Kulai", state: "Johor", flag: "Johor" },
  { id: "JHR03", name: "Kluang, Pontian", state: "Johor", flag: "Johor" },
  { id: "JHR04", name: "Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak", state: "Johor", flag: "Johor" },
  { id: "KDH01", name: "Kota Setar, Kubang Pasuk, Pokok Sena", state: "Kedah", flag: "Kedah" },
  { id: "KDH02", name: "Kuala Muda, Yan, Pendang", state: "Kedah", flag: "Kedah" },
  { id: "KDH03", name: "Padang Terap, Sik", state: "Kedah", flag: "Kedah" },
  { id: "KDH04", name: "Baling", state: "Kedah", flag: "Kedah" },
  { id: "KDH05", name: "Bandar Baharu, Kulim", state: "Kedah", flag: "Kedah" },
  { id: "KDH06", name: "Langkawi", state: "Kedah", flag: "Kedah" },
  { id: "KDH07", name: "Puncak Gunung Jerai", state: "Kedah", flag: "Kedah" },
  { id: "KTN01", name: "Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku", state: "Kelantan", flag: "Kelantan" },
  { id: "KTN03", name: "Gua Musang (Daerah Galas Dan Bertam)", state: "Kelantan", flag: "Kelantan" },
  { id: "MLK01", name: "Seluruh Negeri Melaka", state: "Melaka", flag: "Melaka" },
  { id: "NGS01", name: "Tampin, Jempol", state: "Negeri Sembilan", flag: "Negeri Sembilan" },
  { id: "NGS02", name: "Jelebu, Kuala Pilah, Rembau", state: "Negeri Sembilan", flag: "Negeri Sembilan" },
  { id: "NGS03", name: "Port Dickson, Seremban", state: "Negeri Sembilan", flag: "Negeri Sembilan" },
  { id: "PHG01", name: "Pulau Tioman", state: "Pahang", flag: "Pahang" },
  { id: "PHG02", name: "Kuantan, Pekan, Muadzam Shah, Rompin", state: "Pahang", flag: "Pahang" },
  { id: "PHG03", name: "Jerantut, Temerloh, Maran, Bera, Chenor, Jengka", state: "Pahang", flag: "Pahang" },
  { id: "PHG04", name: "Bentong, Lipis, Raub", state: "Pahang", flag: "Pahang" },
  { id: "PHG05", name: "Genting Sempah, Janda Baik, Bukit Tinggi", state: "Pahang", flag: "Pahang" },
  { id: "PHG06", name: "Cameron Highlands, Genting Highlands", state: "Pahang", flag: "Pahang" },
  { id: "PRK01", name: "Tapah, Slim River, Tanjung Malim", state: "Perak", flag: "Perak" },
  { id: "PRK02", name: "Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar", state: "Perak", flag: "Perak" },
  { id: "PRK03", name: "Pengkalan Hulu, Grik, Lenggong", state: "Perak", flag: "Perak" },
  { id: "PRK04", name: "Temengor, Belum", state: "Perak", flag: "Perak" },
  { id: "PRK05", name: "Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor", state: "Perak", flag: "Perak" },
  { id: "PRK06", name: "Selama, Taiping, Bagan Serai, Parit Buntar", state: "Perak", flag: "Perak" },
  { id: "PRK07", name: "Bukit Larut", state: "Perak", flag: "Perak" },
  { id: "PLS01", name: "Kangar, Padang Besar, Arau", state: "Perlis", flag: "Perlis" },
  { id: "PNG01", name: "Seluruh Negeri Pulau Pinang", state: "Pulau Pinang", flag: "Pulau Pinang" },
  { id: "SBH01", name: "Bahagian Sandakan (Timur)", state: "Sabah", flag: "Sabah" },
  { id: "SBH02", name: "Bahagian Sandakan (Barat)", state: "Sabah", flag: "Sabah" },
  { id: "SBH03", name: "Bahagian Tawau (Timur)", state: "Sabah", flag: "Sabah" },
  { id: "SBH04", name: "Bahagian Tawau (Barat)", state: "Sabah", flag: "Sabah" },
  { id: "SBH05", name: "Bahagian Pantai Barat", state: "Sabah", flag: "Sabah" },
  { id: "SBH06", name: "Bahagian Interior", state: "Sabah", flag: "Sabah" },
  { id: "SBH07", name: "Bahagian Kudat", state: "Sabah", flag: "Sabah" },
  { id: "SBH08", name: "Puncak Gunung Kinabalu", state: "Sabah", flag: "Sabah" },
  { id: "SGR01", name: "Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam", state: "Selangor", flag: "Selangor" },
  { id: "SGR02", name: "Kuala Selangor, Sabak Bernam", state: "Selangor", flag: "Selangor" },
  { id: "SGR03", name: "Klang, Kuala Langat", state: "Selangor", flag: "Selangor" },
  { id: "SWK01", name: "Limbang, Lawas, Sundar, Trusan", state: "Sarawak", flag: "Sarawak" },
  { id: "SWK02", name: "Miri, Niah, Bekenu, Sibuti, Marudi", state: "Sarawak", flag: "Sarawak" },
  { id: "SWK03", name: "Sibu, Kanowit, Dalat, Mukah, Matu, Daro, Sarikei", state: "Sarawak", flag: "Sarawak" },
  { id: "SWK04", name: "Kapit, Song, Belaga", state: "Sarawak", flag: "Sarawak" },
  { id: "SWK05", name: "Kuching, Bau, Lundu, Sematan", state: "Sarawak", flag: "Sarawak" },
  { id: "SWK06", name: "Sri Aman, Betong, Debak, Kabong, Lingga, Engkilili", state: "Sarawak", flag: "Sarawak" },
  { id: "SWK07", name: "Bintulu, Tatau, Sebauh, Belaga", state: "Sarawak", flag: "Sarawak" },
  { id: "SWK08", name: "Pekan Spaoh, Pusa, Roban, Debak, Kabong", state: "Sarawak", flag: "Sarawak" },
  { id: "SWK09", name: "Samariang, Lundu, Sematan", state: "Sarawak", flag: "Sarawak" },
  { id: "TRG01", name: "Kuala Terengganu, Marang, Kuala Nerus", state: "Terengganu", flag: "Terengganu" },
  { id: "TRG02", name: "Besut, Setiu", state: "Terengganu", flag: "Terengganu" },
  { id: "TRG03", name: "Hulu Terengganu", state: "Terengganu", flag: "Terengganu" },
  { id: "TRG04", name: "Dungun, Kemaman", state: "Terengganu", flag: "Terengganu" },
  { id: "WLY01", name: "Kuala Lumpur, Putrajaya", state: "Wilayah Persekutuan", flag: "Wilayah Persekutuan" },
  { id: "WLY02", name: "Labuan", state: "Wilayah Persekutuan", flag: "Wilayah Persekutuan" }
];
const GET = async () => {
  return new Response(JSON.stringify({ zones: ZONES }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
    }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
