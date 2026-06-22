import type { APIRoute } from 'astro';
import type { SolatResponse, SolatDay } from '../../lib/solat/types';
import { checkRateLimit, rateLimitResponse } from '../../../lib/rateLimit';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  // Rate limit: 60 requests per minute per IP
  const rl = await checkRateLimit(request);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfter);

  const { zone } = params;

  if (!zone || !/^[A-Z]{3}\d{2}$/i.test(zone)) {
    return new Response(JSON.stringify({ error: 'Invalid zone format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`https://api.waktusolat.app/v2/solat/${zone.toUpperCase()}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch prayer times' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();

    // The waktusolat.app v2 response shape:
    // { zone, year, month_number, prayers: [{ day, hijri, fajr, syuruk, dhuhr, asr, maghrib, isha }] }
    // `day` is an integer (day of month), `year` and `month_number` are at top level.
    const raw = data.data ?? data;
    const year = Number(raw.year);
    const month = Number(raw.month_number);
    const rawPrayers: Record<string, unknown>[] = raw.prayers || [];

    const prayers: SolatDay[] = rawPrayers.map((p) => {
      // Build YYYY-MM-DD date from top-level year/month + per-entry day integer
      const dayNum = Number(p.day);
      let dateStr = '';
      if (year && month && dayNum) {
        dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      } else if (typeof p.date === 'string') {
        // Fallback: normalize if the API ever provides a date string
        dateStr = normalizeDateStr(String(p.date));
      }

      // Compute imsak as fajr - 10 minutes if not provided
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
        imsak: imsakTime,
      };
    });

    const response: SolatResponse = {
      zone: zone.toUpperCase(),
      prayers,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function formatTime(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'number') {
    // Unix timestamp in seconds — convert to HH:mm in MYT (UTC+8)
    const date = new Date(val * 1000);
    const hours = date.getUTCHours() + 8; // MYT offset
    const minutes = date.getUTCMinutes();
    return `${String(hours % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  if (typeof val === 'string') {
    // If already HH:mm format
    if (/^\d{2}:\d{2}$/.test(val)) return val;
    // Try parsing as ISO date
    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      const hours = date.getUTCHours() + 8;
      const minutes = date.getUTCMinutes();
      return `${String(hours % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }
  return '';
}

/**
 * Normalize various date string formats to YYYY-MM-DD.
 * Handles: DD-MM-YYYY, DD/MM/YYYY, ISO 8601, etc.
 */
function normalizeDateStr(val: string): string {
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = val.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }
  // Try ISO / general parse
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return '';
}

/**
 * Compute Imsak time as 10 minutes before Fajr.
 * Expects fajrStr in HH:mm format. Returns HH:mm or '' if invalid.
 */
function computeImsak(fajrStr: string): string {
  if (!/^\d{2}:\d{2}$/.test(fajrStr)) return '';
  const [h, m] = fajrStr.split(':').map(Number);
  let totalMin = h * 60 + m - 10;
  if (totalMin < 0) totalMin += 1440; // wrap past midnight
  const ih = Math.floor(totalMin / 60) % 24;
  const im = totalMin % 60;
  return `${String(ih).padStart(2, '0')}:${String(im).padStart(2, '0')}`;
}
