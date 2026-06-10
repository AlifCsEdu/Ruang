/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly TURSO_URL: string;
  readonly TURSO_TOKEN: string;
  readonly SUNNAH_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
