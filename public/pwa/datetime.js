// Calendar arithmetic is separate from elapsed-time arithmetic: never add 24h to a day.
export const pad = n => String(n).padStart(2, '0');
export function parseDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) throw new Error('日付を YYYY-MM-DD の形式で入力してください。');
  const [year, month, day] = m.slice(1).map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (year < 1000 || year > 9998 || check.getUTCFullYear() !== year || check.getUTCMonth() + 1 !== month || check.getUTCDate() !== day) throw new Error('有効な日付を入力してください（1000〜9998年）。');
  return { year, month, day };
}
export function shiftDate(value, days) {
  const { year, month, day } = parseDate(value);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
export function parseTime(value) {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!m || +m[1] > 35 || +m[2] > 59 || +(m[3] || 0) > 59) throw new Error('時刻は 00:00〜35:59 の形式で入力してください（例：25:00）。');
  return { hour: +m[1], minute: +m[2], second: +(m[3] || 0) };
}
export function toActual(date, time, occurrence = 'earlier') {
  const t = parseTime(time);
  const target = parseDate(shiftDate(date, Math.floor(t.hour / 24)));
  const h = t.hour % 24;
  const d = new Date(target.year, target.month - 1, target.day, h, t.minute, t.second);
  const matches = x => x.getFullYear() === target.year && x.getMonth() + 1 === target.month && x.getDate() === target.day && x.getHours() === h && x.getMinutes() === t.minute && x.getSeconds() === t.second;
  if (!matches(d)) throw new Error('指定した現地時刻は夏時間などの切り替えにより存在しません。別の時刻を選んでください。');
  // Offset sampling detects repeated local times, including half-hour transitions.
  const candidates = new Set([d.getTime()]);
  for (const hours of [-36, -12, 12, 36]) {
    const offset = new Date(d.getTime() + hours * 3600000).getTimezoneOffset();
    const candidate = new Date(d.getTime() + (offset - d.getTimezoneOffset()) * 60000);
    if (matches(candidate)) candidates.add(candidate.getTime());
  }
  const ordered = [...candidates].sort((a, b) => a - b);
  return new Date(occurrence === 'later' ? ordered.at(-1) : ordered[0]);
}
export function toLogical(actual, boundary = 5) {
  if (!Number.isInteger(boundary) || boundary < 0 || boundary > 12) throw new Error('一日の境界は0〜12時で指定してください。');
  const d = new Date(actual);
  if (!Number.isFinite(d.getTime())) throw new Error('有効な日時を指定してください。');
  let date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  let hour = d.getHours();
  if (hour < boundary) { date = shiftDate(date, -1); hour += 24; }
  return { date, hour, minute: d.getMinutes(), second: d.getSeconds(), time: `${pad(hour)}:${pad(d.getMinutes())}` };
}
export function dateLabel(value) {
  const { year, month, day } = parseDate(value);
  const weekday = '日月火水木金土'[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
}
export function validateRange(startDate, startTime, endDate, endTime, startOccurrence, endOccurrence) {
  const start = toActual(startDate, startTime, startOccurrence);
  const end = toActual(endDate, endTime, endOccurrence);
  if (end <= start) throw new Error('終了日時は開始日時より後にしてください。翌日に終わる予定は終了を25:00などで入力するか、終了の生活日付を翌日に変更してください。');
  return { start, end };
}
