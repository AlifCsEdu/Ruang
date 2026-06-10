globalThis.process ??= {};
globalThis.process.env ??= {};
const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah"
];
const HIJRI_MONTHS_AR = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة"
];
function gregorianToHijri(gYear, gMonth, gDay, method = "tabular", dayAdjust = 0) {
  let jd = gregorianToJD(gYear, gMonth, gDay);
  switch (method) {
    case "umm-al-qura":
      jd += 0.5;
      break;
    case "civil":
      break;
    case "local-official":
      break;
    case "sighting":
      jd += 0.5;
      break;
  }
  const result = method === "civil" ? jdToHijriCivil(jd) : jdToHijri(jd);
  if (dayAdjust !== 0) {
    const adjustedJd = jd + dayAdjust;
    return method === "civil" ? jdToHijriCivil(adjustedJd) : jdToHijri(adjustedJd);
  }
  return result;
}
function gregorianToJD(year, month, day) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}
function jdToHijri(jd) {
  jd = Math.floor(jd) + 0.5;
  const y = 10631 / 30;
  const epoch = 19484395e-1;
  const shift = 8.01 / 60;
  let z = jd - epoch;
  const cyc = Math.floor(z / 10631);
  z = z - 10631 * cyc;
  const j = Math.floor((z - shift) / y);
  z = z - Math.floor(j * y + shift);
  const m = Math.min(Math.floor((z + 28.5001) / 29.5001), 12);
  if (m === 0) return { year: 1, month: 1, day: 1, monthName: HIJRI_MONTHS[0], monthNameAr: HIJRI_MONTHS_AR[0] };
  const year = 30 * cyc + j + 1;
  const month = m;
  const day = Math.floor(z - Math.floor(29.5001 * m - 29)) + 1;
  return {
    year,
    month,
    day,
    monthName: HIJRI_MONTHS[month - 1],
    monthNameAr: HIJRI_MONTHS_AR[month - 1]
  };
}
function jdToHijriCivil(jd) {
  jd = Math.floor(jd) + 0.5;
  const epoch = 19484395e-1;
  const z = jd - epoch;
  const cyc = Math.floor(z / 10631);
  let rem = z - 10631 * cyc;
  const j = Math.floor(rem / 354.36667);
  rem = rem - Math.floor(j * 354.36667 + 0.5);
  const m = Math.min(Math.floor((rem + 0.5) / 29.5001), 12);
  if (m === 0) return { year: 1, month: 1, day: 1, monthName: HIJRI_MONTHS[0], monthNameAr: HIJRI_MONTHS_AR[0] };
  const year = 30 * cyc + j + 1;
  const month = m;
  const day = Math.floor(rem - Math.floor(29.5001 * m - 29)) + 1;
  return {
    year,
    month,
    day: Math.max(1, day),
    monthName: HIJRI_MONTHS[month - 1],
    monthNameAr: HIJRI_MONTHS_AR[month - 1]
  };
}
function hijriToJD(year, month, day) {
  const epoch = 19484395e-1;
  const y = 10631 / 30;
  const shift = 8.01 / 60;
  const cyc = Math.floor((year - 1) / 30);
  const j = year - 1 - 30 * cyc;
  return Math.floor(j * y + shift) + Math.floor(29.5001 * month - 29) + day + epoch + 10631 * cyc;
}
function hijriToGregorian(hYear, hMonth, hDay) {
  const jd = hijriToJD(hYear, hMonth, hDay);
  return jdToGregorian(jd);
}
function jdToGregorian(jd) {
  jd = jd + 0.5;
  const Z = Math.floor(jd);
  const A = Z < 2299161 ? Z : (() => {
    const alpha = Math.floor((Z - 186721625e-2) / 36524.25);
    return Z + 1 + alpha - Math.floor(alpha / 4);
  })();
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  return { year, month, day };
}
export {
  HIJRI_MONTHS as H,
  HIJRI_MONTHS_AR as a,
  gregorianToHijri as g,
  hijriToGregorian as h
};
