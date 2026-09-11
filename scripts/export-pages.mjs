import assert from 'node:assert/strict';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import worker from '../dist/server/index.js';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs');
const response = await worker.fetch(new Request('https://crownecoyah.github.io/', { headers: { accept: 'text/html' } }), {
  ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) },
}, { waitUntil() {}, passThroughOnException() {} });
assert.equal(response.status, 200, 'Static rendering must succeed');
let html = await response.text();
// This landing page has no client-side behavior: omit hydration and runtime code.
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<link\b(?=[^>]*\brel="modulepreload")[^>]*>/gi, '')
  .replace(/<link\b(?=[^>]*\bas="script")[^>]*>/gi, '');
const local = new Set([...html.matchAll(/\b(?:href|src)="(\/(?!\/)[^"]+)"/g)].map(match => match[1]));
await mkdir(output, { recursive: true });
for (const url of local) {
  const relative = url.slice(1);
  assert(!relative.includes('..') && !relative.includes('?'), `Unsupported asset: ${url}`);
  const from = resolve(root, 'dist/client', relative);
  const to = resolve(output, relative);
  await mkdir(dirname(to), { recursive: true });
  await copyFile(from, to);
}
// Relative paths work on a GitHub project site as well as localhost.
html = html.replace(/\b(href|src)="\/(?!\/)([^"]+)"/g, '$1="./$2"');
assert(!html.includes('Your site is taking shape'));
assert(!/<script\b/i.test(html));
await writeFile(resolve(output, 'index.html'), html);
await writeFile(resolve(output, '.nojekyll'), '');
// Social images occur in metadata (absolute URLs), not local src attributes.
await copyFile(resolve(root, 'public/og.png'), resolve(output, 'og.png'));
await copyFile(resolve(root, 'LICENSE.txt'), resolve(output, 'LICENSE.txt'));
console.log(`Exported static GitHub Pages site: docs/ (${local.size} local assets)`);
