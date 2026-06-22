import { defineMiddleware } from 'astro:middleware';

/**
 * Astro middleware — adds security headers to all SSR responses.
 * Note: Static asset headers are handled separately via public/_headers.
 * This middleware only applies to server-rendered (SSR) responses.
 */
export const onRequest = defineMiddleware(async (_, next) => {
  const response = await next();

  // Security headers for SSR responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Content Security Policy — allow self + trusted external sources
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.waktusolat.app https://api.qurancdn.com https://api.quran.com https://verses.quran.com https://api.sunnah.com",
      "img-src 'self' data: https:",
      "media-src 'self' https://verses.quran.com",
    ].join('; ')
  );

  return response;
});
