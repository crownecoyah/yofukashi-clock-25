import { cp, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
await mkdir(new URL('docs/pwa/', root), { recursive: true });
await cp(new URL('public/pwa/', root), new URL('docs/pwa/', root), { recursive: true });
console.log('Exported PWA: docs/pwa/');
