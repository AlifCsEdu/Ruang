/**
 * Static centroid coordinates for all JAKIM prayer zones.
 * Used for GPS-to-zone mapping via Haversine distance.
 * Coordinates are approximate geographic centers of each zone.
 */

export interface ZoneCoord {
  id: string;
  lat: number;
  lng: number;
}

export const ZONE_COORDS: ZoneCoord[] = [
  // Johor
  { id: 'JHR01', lat: 1.4854, lng: 103.7294 },  // Pulau Aur, Pulau Pemanggil
  { id: 'JHR02', lat: 2.0300, lng: 103.3600 },   // Johor Bahru, Kota Tinggi, Mersing, Kulai
  { id: 'JHR03', lat: 2.3500, lng: 102.9700 },   // Kluang, Pontian
  { id: 'JHR04', lat: 2.5200, lng: 102.8100 },   // Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak

  // Kedah
  { id: 'KDH01', lat: 6.4400, lng: 100.1900 },   // Kota Setar, Kubang Pasu, Pokok Sena
  { id: 'KDH02', lat: 6.1100, lng: 100.3700 },   // Kuala Muda, Yan, Pendang
  { id: 'KDH03', lat: 5.7500, lng: 100.4800 },   // Padang Terap, Sik
  { id: 'KDH04', lat: 6.2000, lng: 100.6200 },   // Baling
  { id: 'KDH05', lat: 5.5600, lng: 100.4800 },   // Bandar Baharu, Kulim
  { id: 'KDH06', lat: 6.4300, lng: 99.8800 },    // Langkawi
  { id: 'KDH07', lat: 6.3500, lng: 100.5500 },   // Puncak Gunung Jerai

  // Kelantan
  { id: 'KTN01', lat: 5.8300, lng: 102.4000 },   // Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku
  { id: 'KTN03', lat: 5.2500, lng: 102.0500 },   // Gua Musang (Daerah Galas Dan Bertam), Jeli

  // Melaka
  { id: 'MLK01', lat: 2.1900, lng: 102.2500 },   // Seluruh Negeri Melaka

  // Negeri Sembilan
  { id: 'NGS01', lat: 2.7300, lng: 102.1000 },   // Tampin, Jempol
  { id: 'NGS02', lat: 2.9500, lng: 101.8000 },   // Jelebu, Kuala Pilah, Rembau
  { id: 'NGS03', lat: 2.4500, lng: 101.8500 },   // Port Dickson, Seremban

  // Pahang
  { id: 'PHG01', lat: 4.2500, lng: 103.2500 },   // Pulau Tioman
  { id: 'PHG02', lat: 3.5300, lng: 103.4100 },   // Kuantan, Pekan, Muadzam Shah, Rompin
  { id: 'PHG03', lat: 3.8200, lng: 102.4300 },   // Jerantut, Temerloh, Maran, Bera, Chenor, Jengka
  { id: 'PHG04', lat: 4.4200, lng: 101.9700 },   // Bentong, Lipis, Raub
  { id: 'PHG05', lat: 3.3800, lng: 103.7200 },   // Genting Sempah, Janda Baik, Bukit Tinggi
  { id: 'PHG06', lat: 3.1000, lng: 101.7500 },   // Cameron Highlands, Genting Highlands, Bukit Fraser

  // Perak
  { id: 'PRK01', lat: 5.0500, lng: 100.7400 },   // Tapah, Slim River, Tanjung Malim
  { id: 'PRK02', lat: 4.5800, lng: 101.0700 },   // Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar
  { id: 'PRK03', lat: 4.1800, lng: 100.9500 },   // Pengkalan Hulu, Grik, Lenggong
  { id: 'PRK04', lat: 3.8800, lng: 100.9500 },   // Temengor, Belum
  { id: 'PRK05', lat: 4.4700, lng: 100.4600 },   // Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor
  { id: 'PRK06', lat: 5.1500, lng: 100.5500 },   // Selama, Taiping, Bagan Serai, Parit Buntar
  { id: 'PRK07', lat: 4.8500, lng: 100.7300 },   // Bukit Larut

  // Perlis
  { id: 'PLS01', lat: 6.4400, lng: 100.1900 },   // Kangar, Padang Besar, Arau

  // Pulau Pinang
  { id: 'PNG01', lat: 5.4100, lng: 100.3400 },   // Seluruh Negeri Pulau Pinang

  // Sabah
  { id: 'SBH01', lat: 5.9800, lng: 116.0700 },   // Bahagian Sandakan (Timur), Bukit Garam, Semawang, Temanggong, Tambisan, Bandar Sandakan, Sukau
  { id: 'SBH02', lat: 5.5500, lng: 117.7500 },   // Bahagian Sandakan (Barat), Pinangah, Terusan, Kuamut, Beluran, Telupid
  { id: 'SBH03', lat: 5.2800, lng: 118.0700 },   // Lahad Datu, Silabukan, Kunak, Sahabat, Semporna, Tawau
  { id: 'SBH04', lat: 4.6800, lng: 117.9700 },   // Bandar Tawau, Balong, Merotai, Kalabakan
  { id: 'SBH05', lat: 5.9400, lng: 116.5000 },   // Bahagian Kudat, Kota Marudu, Pitas, Pulau Banggi, Kudat, Usukan
  { id: 'SBH06', lat: 6.0400, lng: 116.2000 },   // Gunung Kinabalu
  { id: 'SBH07', lat: 5.9300, lng: 115.8700 },   // Bahagian Pantai Barat, Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan
  { id: 'SBH08', lat: 5.3500, lng: 115.7500 },   // Bahagian Pedalaman (Atas), Keningau, Tambunan, Nabawan, Pensiangan, Sook
  { id: 'SBH09', lat: 5.0200, lng: 115.8700 },   // Bahagian Pedalaman (Bawah), Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pa Sia, Membakut, Weston

  // Sarawak
  { id: 'SWK01', lat: 1.5500, lng: 110.3300 },   // Limbang, Lawas, Sundar, Trusan
  { id: 'SWK02', lat: 4.3200, lng: 114.2500 },   // Miri, Niah, Bekenu, Sibuti, Marudi
  { id: 'SWK03', lat: 2.5200, lng: 112.3500 },   // Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu
  { id: 'SWK04', lat: 2.1200, lng: 111.9000 },   // Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit
  { id: 'SWK05', lat: 1.7800, lng: 112.1500 },   // Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai
  { id: 'SWK06', lat: 2.3200, lng: 111.8700 },   // Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkilili, Betong, Spaoh, Pusa, Saratok
  { id: 'SWK07', lat: 1.4500, lng: 110.9000 },   // Serian, Simunjan, Samarahan, Sebuyau, Meludam
  { id: 'SWK08', lat: 1.5500, lng: 110.3500 },   // Kuching, Bau, Lundu, Sematan
  { id: 'SWK09', lat: 1.0500, lng: 111.4500 },   // Zon Khas (Kampung Patarikan)

  // Selangor
  { id: 'SGR01', lat: 3.1200, lng: 101.5200 },   // Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, S.Alam
  { id: 'SGR02', lat: 3.4000, lng: 101.2000 },   // Kuala Selangor, Sabak Bernam
  { id: 'SGR03', lat: 2.8800, lng: 101.4800 },   // Klang, Kuala Langat

  // Terengganu
  { id: 'TRG01', lat: 5.3200, lng: 103.1400 },   // Kuala Terengganu, Marang, Kuala Nerus
  { id: 'TRG02', lat: 4.7800, lng: 103.3000 },   // Besut, Setiu
  { id: 'TRG03', lat: 4.3500, lng: 102.8300 },   // Hulu Terengganu
  { id: 'TRG04', lat: 4.0500, lng: 103.3800 },   // Dungun, Kemaman

  // Wilayah Persekutuan
  { id: 'WLY01', lat: 3.1400, lng: 101.6900 },   // Kuala Lumpur, Putrajaya
  { id: 'WLY02', lat: 5.2800, lng: 115.2300 },   // Labuan
];
