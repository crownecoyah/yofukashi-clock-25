import { pad, toLogical, toActual, dateLabel, validateRange } from './datetime.js';
import { exportICS } from './ics.js';
import { DEFAULT_SETTINGS, readSettings, saveSettings, openStore, listEvents, writeEvent } from './storage.js';
const $ = id => document.getElementById(id);
let settings = { ...DEFAULT_SETTINGS }, db, events = [], editing = null, deleting = null;
let lastDay = '', lastMinute = '', saving = false, settingsAvailable = true;
const userError = (error, fallback) => /[ぁ-んァ-ヶ一-龠]/.test(error?.message || '') ? error.message : fallback;
const say = message => { $('status').textContent = message; $('status').hidden = !message; };
const warn = message => { $('storage-warning').textContent = message; $('storage-warning').hidden = false; };
const zoneName = () => Intl.DateTimeFormat().resolvedOptions().timeZone || '端末の現地時刻';
const realLabel = value => new Date(value).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
try { settings = readSettings(); saveSettings(settings); }
catch { settingsAvailable = false; warn('設定の保存領域が利用できません。設定は今回の画面内だけに反映されます。ブラウザのサイトデータ設定を確認してください。'); }
for (let hour = 0; hour <= 12; hour++) {
  const option = document.createElement('option'); option.value = hour; option.textContent = `${hour}時まで今日`; $('boundary').append(option);
}
for (const key of ['boundary', 'font', 'size']) $(key).value = settings[key];
$('seconds').checked = settings.seconds;
function applySettings() {
  $('digital').dataset.font = settings.font; $('digital').dataset.size = settings.size;
  $('boundary-badge').textContent = `${settings.boundary}時まで今日`;
  tick(); renderEvents();
}
for (const key of ['boundary', 'font', 'size', 'seconds']) $(key).addEventListener('change', () => {
  settings = { boundary: +$('boundary').value, font: $('font').value, size: $('size').value, seconds: $('seconds').checked };
  try { saveSettings(settings); say('設定を保存しました。'); }
  catch { settingsAvailable = false; warn('設定の端末内保存に失敗しました。今回の画面には反映しましたが、再起動後は保持されない場合があります。'); }
  applySettings();
});
for (let i = 0; i < 60; i++) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  for (const [key, value] of Object.entries({ x1: 140, y1: 18, x2: 140, y2: i % 5 ? 22 : 27, transform: `rotate(${i * 6} 140 140)`, class: i % 5 ? 'tick' : 'tick major' })) line.setAttribute(key, value);
  $('ticks').append(line);
}
function tick() {
  const now = new Date(), logical = toLogical(now, settings.boundary);
  $('logical-date').textContent = dateLabel(logical.date);
  $('digital').replaceChildren(document.createTextNode(logical.time));
  if (settings.seconds) { const span = document.createElement('span'); span.className = 'seconds'; span.textContent = `:${pad(logical.second)}`; $('digital').append(span); }
  $('digital').setAttribute('aria-label', `生活時刻 ${logical.hour}時${logical.minute}分${settings.seconds ? `${logical.second}秒` : ''}`);
  $('actual-time').textContent = realLabel(now);
  $('zone').textContent = `${zoneName()} · 端末の時刻`;
  $('hour-hand').style.transform = `rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)`;
  $('minute-hand').style.transform = `rotate(${now.getMinutes() * 6 + now.getSeconds() / 10}deg)`;
  $('second-hand').style.transform = `rotate(${now.getSeconds() * 6}deg)`;
  $('second-hand').style.display = settings.seconds ? '' : 'none';
  const minute = `${now.getTime() - now.getSeconds() * 1000 - now.getMilliseconds()}`;
  if (lastDay !== logical.date || minute !== lastMinute) { lastDay = logical.date; lastMinute = minute; if (!$('events').contains(document.activeElement)) renderEvents(); }
}
function element(tag, text, className) { const node = document.createElement(tag); node.textContent = text; if (className) node.className = className; return node; }
function action(text, fn) { const button = element('button', text); button.type = 'button'; button.addEventListener('click', fn); return button; }
async function reloadEvents() { if (db) { events = await listEvents(db); renderEvents(); } }
function renderEvents() {
  if (!db) return;
  const today = toLogical(new Date(), settings.boundary).date, now = Date.now(), filter = $('filter').value;
  const shown = events.filter(e => filter === 'all' || (filter === 'today' ? toLogical(e.start, settings.boundary).date === today : new Date(e.end).getTime() > now));
  // Actual chronological order is also logical-day / extended-time order, including midnight.
  $('events').replaceChildren(); $('event-count').textContent = `${shown.length}件表示 / 保存済み ${events.length}件`;
  $('export-all').disabled = !events.length;
  if (!shown.length) $('events').append(element('p', '予定はありません。今日の続きの予定を、25時で追加してみましょう。', 'empty'));
  let day;
  for (const event of shown) {
    const start = toLogical(event.start, settings.boundary), end = toLogical(event.end, settings.boundary);
    if (day !== start.date) { day = start.date; $('events').append(element('h3', `${day === today ? '今日 · ' : ''}${dateLabel(day)}`, 'day-heading')); }
    const card = element('article', '', 'event');
    if (new Date(event.start) <= now && new Date(event.end) > now) card.classList.add('active');
    card.append(element('p', `${start.time} ～ ${start.date === end.date ? '' : `${end.date.replaceAll('-', '/')} `}${end.time}`, 'event-time'), element('h4', event.title));
    if (event.note) card.append(element('p', event.note, 'event-note'));
    const controls = element('div', '', 'actions');
    controls.append(action('編集', () => openEditor(event)), action('削除', () => {
      deleting = event; $('delete-name').textContent = event.title; $('delete-error').textContent = ''; $('delete-dialog').showModal(); $('cancel-delete').focus();
    }), action('カレンダーに追加', () => exportOne(event, true)), action('ICSを保存', () => exportOne(event, false)));
    card.append(controls); $('events').append(card);
  }
}
async function exportOne(event, share) { try { say(await exportICS([event], share)); } catch (error) { say(userError(error, 'ICS書き出しに失敗しました。再度お試しください。')); } }
$('export-all').addEventListener('click', async () => { try { say(await exportICS(events, false)); } catch { say('ICS書き出しに失敗しました。予定の日時を確認してください。'); } });
$('filter').addEventListener('change', renderEvents);
function openEditor(event = null) {
  editing = event; $('event-form').reset(); $('form-error').hidden = true;
  $('editor-title').textContent = event ? '予定を編集' : '予定を追加';
  const now = new Date(); now.setSeconds(0, 0);
  const start = toLogical(event ? event.start : now, settings.boundary);
  const endDate = event ? new Date(event.end) : new Date(now.getTime() + 60 * 60000);
  const end = toLogical(endDate, settings.boundary);
  $('title').value = event?.title || ''; $('note').value = event?.note || '';
  $('start-date').value = start.date; $('start-time').value = start.time;
  $('end-date').value = end.date; $('end-time').value = end.time;
  for (const [side, logical, actual] of [['start', start, event?.start], ['end', end, event?.end]]) {
    $(side + '-occurrence').value = actual && toActual(logical.date, logical.time).getTime() !== new Date(actual).getTime() ? 'later' : 'earlier';
  }
  preview(); $('editor').showModal(); $('title').focus();
}
function range() { return validateRange($('start-date').value, $('start-time').value, $('end-date').value, $('end-time').value, $('start-occurrence').value, $('end-occurrence').value); }
function preview() {
  try { const { start, end } = range(); $('actual-preview').textContent = `実際の日時：${realLabel(start)} ～ ${realLabel(end)}\n${zoneName()}（UTC${offsetLabel(start)} / UTC${offsetLabel(end)}）`; }
  catch (error) { $('actual-preview').textContent = error.message; }
}
function offsetLabel(date) { const mins = -date.getTimezoneOffset(); return `${mins >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(mins) / 60))}:${pad(Math.abs(mins) % 60)}`; }
for (const id of ['start-date', 'start-time', 'end-date', 'end-time', 'start-occurrence', 'end-occurrence']) $(id).addEventListener('input', preview);
$('add').addEventListener('click', () => openEditor());
function closeEditor() { if (!saving) $('editor').close(); }
$('cancel').addEventListener('click', closeEditor); $('close-editor').addEventListener('click', closeEditor);
$('editor').addEventListener('cancel', event => { if (saving) event.preventDefault(); });
$('event-form').addEventListener('submit', async event => {
  event.preventDefault(); if (saving || !db) return;
  $('form-error').hidden = true;
  try {
    const title = $('title').value.trim();
    if (!title) { $('title').focus(); throw new Error('予定のタイトルを入力してください。'); }
    const { start, end } = range();
    const stamp = new Date().toISOString();
    const entry = { id: editing?.id || crypto.randomUUID(), title, start: start.toISOString(), end: end.toISOString(), note: $('note').value.trim(), createdAt: editing?.createdAt || stamp, updatedAt: stamp, timeZone: zoneName() };
    saving = true; $('save').disabled = true;
    await writeEvent(db, entry, editing); await reloadEvents(); $('editor').close(); say(editing ? '予定を更新しました。' : '予定を保存しました。');
  } catch (error) { $('form-error').textContent = userError(error, '端末内保存に失敗しました。再度お試しください。'); $('form-error').hidden = false; }
  finally { saving = false; $('save').disabled = false; }
});
$('cancel-delete').addEventListener('click', () => $('delete-dialog').close());
$('confirm-delete').addEventListener('click', async () => {
  if (!deleting || !db) return;
  $('confirm-delete').disabled = true;
  try { await writeEvent(db, deleting, deleting, true); await reloadEvents(); $('delete-dialog').close(); say('予定を削除しました。'); }
  catch (error) { $('delete-error').textContent = userError(error, '予定の削除に失敗しました。'); }
  finally { $('confirm-delete').disabled = false; }
});
applySettings();
setInterval(tick, 1000);
try { db = await openStore(); await reloadEvents(); $('add').disabled = false; }
catch (error) { warn(userError(error, 'ストレージが利用できません。予定は保存できません。')); $('events').replaceChildren(element('p', '予定の保存領域が利用できません。時計はそのまま使えます。', 'empty')); }
window.addEventListener('focus', async () => { tick(); try { await reloadEvents(); if (settingsAvailable) { settings = readSettings(); for (const key of ['boundary', 'font', 'size']) $(key).value = settings[key]; $('seconds').checked = settings.seconds; applySettings(); } } catch { warn('保存データを読み込めませんでした。再読み込みしてください。'); } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
let installPrompt;
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
$('install-help').hidden = standalone();
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; if (!standalone()) $('install').hidden = false; });
$('install').addEventListener('click', async () => {
  if (!installPrompt) return;
  try { await installPrompt.prompt(); await installPrompt.userChoice; }
  catch { say('インストール案内を開けませんでした。ブラウザのメニューをご確認ください。'); }
  installPrompt = null; $('install').hidden = true;
});
window.addEventListener('appinstalled', () => { $('install-help').hidden = true; installPrompt = null; });
if ('serviceWorker' in navigator) {
  try {
    const registration = await navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' });
    const updateNotice = () => { if (registration.waiting && registration.active) say('新しいバージョンがあります。すべてのブラウザ版のタブ・アプリを閉じて開き直すと更新されます。予定と設定は保持されます。'); };
    updateNotice(); registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed') updateNotice(); if (worker.state === 'redundant' && !registration.active) { $('offline-state').textContent = 'オフライン準備に失敗しました。オンラインで再読み込みしてください。'; say($('offline-state').textContent); } }); });
    navigator.serviceWorker.ready.then(() => { $('offline-state').textContent = 'オフラインの準備ができました。時計・予定・設定・ICS作成をこの端末で使えます。'; });
  } catch { $('offline-state').textContent = 'Service Workerの登録に失敗しました。オフラインでは起動できない場合があります。HTTPS接続やブラウザ設定を確認し、再読み込みしてください。'; say($('offline-state').textContent); }
} else { $('offline-state').textContent = 'このブラウザではService Workerを利用できません。オフライン起動は対応していません。'; say($('offline-state').textContent); }
