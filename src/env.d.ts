/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SUNNAH_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
