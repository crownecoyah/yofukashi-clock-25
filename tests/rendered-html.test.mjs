import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../docs/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');

test('static site is complete without JavaScript or root-relative project assets', () => {
  assert.match(html, /<html[^>]*lang="ja"/);
  assert.match(html, /<title>夜ふかし時計25時/);
  assert.match(html, /25<span>[:：]<\/span>25/);
  assert.match(html, /macOS 14以降/);
  assert.match(html, /Developer ID署名/);
  assert.match(html, /公証/);
  assert.doesNotMatch(html, /Your site is taking shape|Starter Project|<script\b/i);
  assert.doesNotMatch(html, /(?:src|href)="\/(?!\/)/);
});

test('all local assets and anchor targets exist', async () => {
  for (const [, url] of html.matchAll(/\b(?:href|src)="([^"<>]+)"/g)) {
    if (url.startsWith('./')) await access(new URL(url, root));
    if (url.startsWith('#')) assert(html.includes(`id="${url.slice(1)}"`), url);
  }
  await access(new URL('.nojekyll', root));
  await access(new URL('og.png', root));
});

test('download URLs target the approved account, repository and release', () => {
  const links = [...html.matchAll(/href="([^"]*\/releases\/download\/[^"<>]+)"/g)].map(x => x[1]);
  assert(links.length >= 3);
  for (const url of links) assert(url.startsWith('https://github.com/crownecoyah/yofukashi-clock-25/releases/download/v1.0.0/'), url);
  assert.match(html, /yofukashi-clock-25-v1\.0\.0-macOS\.zip/);
  assert.match(html, /property="og:image"[^>]*content="https:\/\/crownecoyah\.github\.io\/yofukashi-clock-25\/og\.png"/);
});
