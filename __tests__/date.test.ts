import {
  addDays,
  addMonths,
  buildMonthGrid,
  currentStreak,
  daysSince,
  formatFullDate,
  formatMonthYear,
  formatNiceDate,
  startOfMonth,
  toDateStr,
  todayStr,
  weekdayIndex,
} from '../src/utils/date';
import { NOW, TODAY } from './helpers';

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('toDateStr / todayStr', () => {
  it('formats a date as zero-padded yyyy-mm-dd in local time', () => {
    expect(toDateStr(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toDateStr(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('returns today in local time', () => {
    expect(todayStr()).toBe(TODAY);
  });
});

describe('addDays', () => {
  it('adds and subtracts days', () => {
    expect(addDays('2026-03-15', 1)).toBe('2026-03-16');
    expect(addDays('2026-03-15', -15)).toBe('2026-02-28');
    expect(addDays('2026-03-15', 0)).toBe('2026-03-15');
  });

  it('rolls over month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
  });

  it('handles leap years', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('is unaffected by daylight-saving transitions', () => {
    // US DST starts 2026-03-08; spanning it must still move exactly one day per step.
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(addDays('2026-03-01', 100)).toBe('2026-06-09');
  });
});

describe('daysSince', () => {
  it('counts whole days between a date and today', () => {
    expect(daysSince(TODAY)).toBe(0);
    expect(daysSince('2026-03-14')).toBe(1);
    expect(daysSince('2026-03-01')).toBe(14);
  });

  it('is negative for future dates', () => {
    expect(daysSince('2026-03-20')).toBe(-5);
  });
});

describe('currentStreak', () => {
  it('is 0 with no completions', () => {
    expect(currentStreak([])).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    expect(currentStreak(['2026-03-13', '2026-03-14', '2026-03-15'])).toBe(3);
  });

  it('keeps the streak alive if today is not done yet but yesterday was', () => {
    expect(currentStreak(['2026-03-13', '2026-03-14'])).toBe(2);
  });

  it('is 0 when the last completion was two or more days ago', () => {
    expect(currentStreak(['2026-03-12', '2026-03-13'])).toBe(0);
  });

  it('stops at the first gap', () => {
    expect(currentStreak(['2026-03-10', '2026-03-11', '2026-03-14', '2026-03-15'])).toBe(2);
  });

  it('ignores order and duplicates', () => {
    expect(currentStreak(['2026-03-15', '2026-03-14', '2026-03-15'])).toBe(2);
  });

  it('counts across a month boundary', () => {
    jest.setSystemTime(new Date(2026, 3, 2, 12)); // 2026-04-02
    expect(currentStreak(['2026-03-31', '2026-04-01', '2026-04-02'])).toBe(3);
  });
});

describe('formatNiceDate', () => {
  it('formats a short month + day', () => {
    const formatted = formatNiceDate('2026-03-05');
    expect(formatted).toMatch(/Mar/);
    expect(formatted).toMatch(/\b5\b/);
  });
});

describe('formatFullDate / formatMonthYear', () => {
  it('includes weekday and year for a full date', () => {
    const formatted = formatFullDate('2026-03-15');
    expect(formatted).toMatch(/Mar/);
    expect(formatted).toMatch(/15/);
    expect(formatted).toMatch(/2026/);
  });

  it('formats a month heading', () => {
    const formatted = formatMonthYear('2026-03-01');
    expect(formatted).toMatch(/March/);
    expect(formatted).toMatch(/2026/);
  });
});

describe('calendar helpers', () => {
  it('startOfMonth and addMonths move by calendar months', () => {
    expect(startOfMonth('2026-03-15')).toBe('2026-03-01');
    expect(addMonths('2026-03-01', -1)).toBe('2026-02-01');
    expect(addMonths('2026-12-01', 1)).toBe('2027-01-01');
  });

  it('weekdayIndex uses local Sunday=0', () => {
    // 2026-03-01 is a Sunday
    expect(weekdayIndex('2026-03-01')).toBe(0);
    expect(weekdayIndex('2026-03-15')).toBe(0);
  });

  it('buildMonthGrid pads to full weeks with real flanking dates', () => {
    const cells = buildMonthGrid('2026-03-01');
    expect(cells.length % 7).toBe(0);
    expect(cells.filter((c) => c.inMonth)).toHaveLength(31);
    expect(cells[0]).toEqual({ dateStr: '2026-03-01', day: 1, inMonth: true });
    expect(cells.find((c) => c.dateStr === '2026-03-15')).toEqual({
      dateStr: '2026-03-15',
      day: 15,
      inMonth: true,
    });
    // April 1 follows March 31 in the trailing pad
    expect(cells[cells.length - 1].dateStr >= '2026-03-31').toBe(true);
  });
});
