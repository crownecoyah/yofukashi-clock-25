export function escapeText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
}
export function foldLine(line) {
  const encoder = new TextEncoder();
  let output = '', length = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (length + bytes > 75) { output += '\r\n '; length = 1; }
    output += char; length += bytes;
  }
  return output;
}
export function utcStamp(value) {
  const d = new Date(value);
  if (!Number.isFinite(d.getTime()) || d.getUTCFullYear() < 1000 || d.getUTCFullYear() > 9999) throw new Error('予定の日時が正しくありません。');
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}
export function makeICS(events, now = new Date()) {
  if (!events.length) throw new Error('書き出す予定がありません。');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Yofukashi Clock 25//PWA//JA', 'CALSCALE:GREGORIAN'];
  for (const event of events) {
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(event.id) || !event.title?.trim() || !(new Date(event.end) > new Date(event.start))) throw new Error('予定の情報が正しくありません。');
    lines.push('BEGIN:VEVENT', `UID:${event.id}@yofukashi-clock-25`, `DTSTAMP:${utcStamp(now)}`, `DTSTART:${utcStamp(event.start)}`, `DTEND:${utcStamp(event.end)}`, `SUMMARY:${escapeText(event.title)}`);
    if (event.note) lines.push(`DESCRIPTION:${escapeText(event.note)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
export function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = file.name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export async function exportICS(events, share = true) {
  let file;
  try { file = new File([makeICS(events)], events.length === 1 ? `yofukashi-${events[0].id}.ics` : 'yofukashi-all.ics', { type: 'text/calendar;charset=utf-8' }); }
  catch { throw new Error('ICSファイルの生成に失敗しました。予定の日時を確認してください。'); }
  if (share && typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
    try {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '夜ふかし時計25時の予定' });
        return '共有画面に渡しました。追加先のカレンダーで日時を確認してください。';
      }
    } catch (error) {
      if (error.name === 'AbortError') return '共有をキャンセルしました。「ICSを保存」からダウンロードもできます。';
      downloadFile(file);
      return '共有機能を利用できなかったため、ICSファイルのダウンロードに切り替えました。';
    }
  }
  downloadFile(file);
  return share ? 'この環境ではファイル共有を利用できないため、ICSファイルをダウンロードします。対応するカレンダーで開いてください。' : 'ICSファイルをダウンロードします。対応するカレンダーで開いてください。';
}
