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

const windows = await readFile(new URL('windows.html', root), 'utf8');
test('Windows sibling is self-contained and all relative targets exist', async () => {
  assert.match(windows, /<html[^>]*lang="ja"/);
  assert.match(windows, /name="viewport"/);
  assert.doesNotMatch(windows, /(?:src|href)="\/(?!\/)/);
  assert.doesNotMatch(windows, /<script\b/);
  for (const [, url] of windows.matchAll(/\b(?:href|src)="([^"<>]+)"/g)) {
    if (url.startsWith('./')) await access(new URL(url, root));
    if (url.startsWith('#')) assert(windows.includes(`id="${url.slice(1)}"`), url);
  }
  assert.match(html, /href="\.\/windows\.html"/);
  assert.match(windows, /href="\.\/index\.html"/);
  for (const [, attrs] of windows.matchAll(/<img\b([^>]+)>/g)) assert.match(attrs, /\balt="[^"]*"/);
});
test('Windows download content agrees with its README and license', async () => {
  assert.match(windows, /NightOwlClock25_Windows\.zip" download/);
  assert.match(windows, /NightOwlClock25_Windows_Source\.zip" download/);
  for (const term of ['生活日付', '0〜12時', '0〜35時', '40〜100 pt', 'ログイン時', '最前面', 'NightOwlClock25.exe']) assert(windows.includes(term), term);
  assert.match(windows, /外部カレンダーへの登録・連携や、予定時刻の通知・アラーム機能はありません/);
  assert.doesNotMatch(windows, /EventKit|Google Calendar|Outlook Calendar|Spaces|macOS 14|Developer ID/);
  const license = await readFile(new URL('downloads/windows/LICENSE.txt', root), 'utf8');
  assert.match(license, /MIT License/);
  assert.match(license, /Copyright \(c\) 2026 黒猫屋倫彦/);
});
