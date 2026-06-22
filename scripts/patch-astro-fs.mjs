import { readFileSync, writeFileSync, existsSync } from 'fs';

const file = 'node_modules/astro/dist/core/fs/index.js';
if (!existsSync(file)) process.exit(0);

let src = readFileSync(file, 'utf-8');
if (src.includes('fs.rmdirSync')) {
  src = src.replace(
    /fs\.rmdirSync\(([^,]+),\s*\{[^}]*\}\)/g,
    'fs.rmSync($1, { recursive: true, force: true })'
  );
  writeFileSync(file, src);
  console.log('[patch] Fixed rmdirSync -> rmSync in astro/dist/core/fs/index.js');
}
