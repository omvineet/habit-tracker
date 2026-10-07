export function todayStr(): string {
  return toDateStr(new Date());
}

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateParts(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

export function addDays(dateStr: string, days: number): string {
  const { year, month, day } = parseDateParts(dateStr);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateStr(date);
}

export function daysSince(dateStr: string): number {
  const { year, month, day } = parseDateParts(dateStr);
  const start = new Date(year, month - 1, day);
  const now = new Date();
  const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((nowMid.getTime() - startMid.getTime()) / 86400000);
}

export function currentStreak(completedDates: string[]): number {
  const set = new Set(completedDates);
  let streak = 0;
  let cursor = todayStr();
  if (!set.has(cursor)) {
    cursor = addDays(cursor, -1);
    if (!set.has(cursor)) return 0;
  }
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function formatNiceDate(dateStr: string): string {
  const { year, month, day } = parseDateParts(dateStr);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatFullDate(dateStr: string): string {
  const { year, month, day } = parseDateParts(dateStr);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonthYear(dateStr: string): string {
  const { year, month, day } = parseDateParts(dateStr);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** First day of the month containing dateStr (yyyy-mm-dd). */
export function startOfMonth(dateStr: string): string {
  const { year, month } = parseDateParts(dateStr);
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

/** Add n calendar months to the month of dateStr; result is always the 1st. */
export function addMonths(dateStr: string, months: number): string {
  const { year, month } = parseDateParts(dateStr);
  const date = new Date(year, month - 1 + months, 1);
  return toDateStr(date);
}

/** Sunday=0 … Saturday=6 for dateStr in local time. */
export function weekdayIndex(dateStr: string): number {
  const { year, month, day } = parseDateParts(dateStr);
  return new Date(year, month - 1, day).getDay();
}

export type CalendarCell = {
  dateStr: string;
  day: number;
  inMonth: boolean;
};

/** Build a Sunday-start grid of calendar cells for the month of monthStr. */
export function buildMonthGrid(monthStr: string): CalendarCell[] {
  const first = startOfMonth(monthStr);
  const { year, month } = parseDateParts(first);
  const lead = weekdayIndex(first);
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < lead; i++) {
    const dateStr = addDays(first, i - lead);
    cells.push({ dateStr, day: parseDateParts(dateStr).day, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ dateStr, day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const dateStr = addDays(first, cells.length - lead);
    cells.push({ dateStr, day: parseDateParts(dateStr).day, inMonth: false });
  }
  return cells;
}
