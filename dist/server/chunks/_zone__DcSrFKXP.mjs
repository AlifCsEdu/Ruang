globalThis.process ??= {};
globalThis.process.env ??= {};
const prerender = false;
const GET = async ({ params }) => {
  const { zone } = params;
  if (!zone || !/^[A-Z]{3}\d{2}$/i.test(zone)) {
    return new Response(JSON.stringify({ error: "Invalid zone format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const res = await fetch(`https://api.waktusolat.app/v2/solat/${zone.toUpperCase()}`, {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch prayer times" }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const data = await res.json();
    const raw = data.data ?? data;
    const year = Number(raw.year);
    const month = Number(raw.month_number);
    const rawPrayers = raw.prayers || [];
    const prayers = rawPrayers.map((p) => {
      const dayNum = Number(p.day);
      let dateStr = "";
      if (year && month && dayNum) {
        dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      } else if (typeof p.date === "string") {
        dateStr = normalizeDateStr(String(p.date));
      }
      const fajrTime = formatTime(p.fajr);
      const imsakTime = p.imsak != null ? formatTime(p.imsak) : computeImsak(fajrTime);
      return {
        date: dateStr,
        fajr: fajrTime,
        syuruk: formatTime(p.syuruk),
        dhuhr: formatTime(p.dhuhr),
        asr: formatTime(p.asr),
        maghrib: formatTime(p.maghrib),
        isha: formatTime(p.isha),
        imsak: imsakTime
      };
    });
    const response = {
      zone: zone.toUpperCase(),
      prayers
    };
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
function formatTime(val) {
  if (val == null) return "";
  if (typeof val === "number") {
    const date = new Date(val * 1e3);
    const hours = date.getUTCHours() + 8;
    const minutes = date.getUTCMinutes();
    return `${String(hours % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
  if (typeof val === "string") {
    if (/^\d{2}:\d{2}$/.test(val)) return val;
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      const hours = date.getUTCHours() + 8;
      const minutes = date.getUTCMinutes();
      return `${String(hours % 24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
  }
  return "";
}
function normalizeDateStr(val) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const dmy = val.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return "";
}
function computeImsak(fajrStr) {
  if (!/^\d{2}:\d{2}$/.test(fajrStr)) return "";
  const [h, m] = fajrStr.split(":").map(Number);
  let totalMin = h * 60 + m - 10;
  if (totalMin < 0) totalMin += 1440;
  const ih = Math.floor(totalMin / 60) % 24;
  const im = totalMin % 60;
  return `${String(ih).padStart(2, "0")}:${String(im).padStart(2, "0")}`;
}
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
