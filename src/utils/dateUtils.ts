/**
 * Date and Week Utilities for Portal Layanan Paramedic Kota Baru
 * Ensures 100% accurate, real-time date calculation and week-based aggregation
 * for attendance recaps, salary slips, and payroll management.
 */

const INDO_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const INDO_MONTHS_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Normalizes any date string (ISO, Discord, slash, dash) to 'YYYY-MM-DD'
 */
export function normalizeDateOnly(dateStr: string): string {
  if (!dateStr) return getCurrentDateStr();
  const trimmed = dateStr.trim();

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    const dd = dmy[1].padStart(2, '0');
    const mm = dmy[2].padStart(2, '0');
    const yyyy = dmy[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymd = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymd) {
    const yyyy = ymd[1];
    const mm = ymd[2].padStart(2, '0');
    const dd = ymd[3].padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fallback: try Date parsing
  const d = new Date(trimmed.replace(' ', 'T'));
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return getCurrentDateStr();
}

/**
 * Returns current local date as 'YYYY-MM-DD'
 */
export function getCurrentDateStr(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns current month key as 'YYYY-MM'
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

/**
 * Calculates Monday ('YYYY-MM-DD') of the week containing dateInput.
 * Week starts on Monday (index 0) and ends on Sunday (index 6).
 */
export function getMondayOfDate(dateInput: Date | string = new Date()): string {
  let date: Date;
  if (typeof dateInput === 'string') {
    const clean = normalizeDateOnly(dateInput);
    const [y, m, d] = clean.split('-').map(Number);
    date = new Date(y, m - 1, d, 12, 0, 0);
  } else {
    date = new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), 12, 0, 0);
  }

  const day = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculates Sunday ('YYYY-MM-DD') for a given Monday ('YYYY-MM-DD')
 */
export function getSundayOfMonday(mondayStr: string): string {
  const [y, m, d] = mondayStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  date.setDate(date.getDate() + 6);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns the 7 days of the week starting from mondayStr:
 * [ { label: 'SEN', dateNum: '26', fullDate: '2026-10-26', dayOfWeekIndex: 0 }, ... ]
 */
export function get7DaysOfWeek(mondayStr: string) {
  const dayLabels = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
  const [y, m, d] = mondayStr.split('-').map(Number);
  const base = new Date(y, m - 1, d, 12, 0, 0);

  return dayLabels.map((label, idx) => {
    const cur = new Date(base);
    cur.setDate(base.getDate() + idx);
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const dd = String(cur.getDate()).padStart(2, '0');
    return {
      label,
      dateNum: dd,
      fullDate: `${yyyy}-${mm}-${dd}`,
      dayOfWeekIndex: idx, // 0 = Senin, 6 = Minggu
    };
  });
}

/**
 * Formats Monday date into a friendly readable range e.g.
 * '26 Okt – 01 Nov 2026' or '05 – 11 Okt 2026'
 */
export function formatWeekRangeDisplay(mondayStr: string): string {
  try {
    const [y1, m1, d1] = mondayStr.split('-').map(Number);
    const monDate = new Date(y1, m1 - 1, d1, 12, 0, 0);
    const sunDate = new Date(monDate);
    sunDate.setDate(monDate.getDate() + 6);

    const dd1 = String(monDate.getDate()).padStart(2, '0');
    const m1Idx = monDate.getMonth();
    const yyyy1 = monDate.getFullYear();

    const dd2 = String(sunDate.getDate()).padStart(2, '0');
    const m2Idx = sunDate.getMonth();
    const yyyy2 = sunDate.getFullYear();

    if (yyyy1 === yyyy2 && m1Idx === m2Idx) {
      return `${dd1} – ${dd2} ${INDO_MONTHS_SHORT[m1Idx]} ${yyyy1}`;
    }

    if (yyyy1 === yyyy2) {
      return `${dd1} ${INDO_MONTHS_SHORT[m1Idx]} – ${dd2} ${INDO_MONTHS_SHORT[m2Idx]} ${yyyy1}`;
    }

    return `${dd1} ${INDO_MONTHS_SHORT[m1Idx]} ${yyyy1} – ${dd2} ${INDO_MONTHS_SHORT[m2Idx]} ${yyyy2}`;
  } catch {
    return mondayStr;
  }
}

/**
 * Formats 'YYYY-MM' into Indonesian e.g. 'Oktober 2026'
 */
export function formatMonthDisplay(monthKey: string): string {
  try {
    const [yyyy, mm] = monthKey.split('-').map(Number);
    return `${INDO_MONTHS_FULL[mm - 1] || 'Bulan'} ${yyyy}`;
  } catch {
    return monthKey;
  }
}

/**
 * Offsets a Monday by a given number of weeks (+1 for next, -1 for previous)
 */
export function shiftWeekMonday(mondayStr: string, weekOffset: number): string {
  const [y, m, d] = mondayStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  date.setDate(date.getDate() + weekOffset * 7);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Checks whether a given duty date falls strictly within the week starting on mondayStr.
 */
export function isDateInWeek(dateStr: string, mondayStr: string): boolean {
  const target = normalizeDateOnly(dateStr);
  const sundayStr = getSundayOfMonday(mondayStr);
  return target >= mondayStr && target <= sundayStr;
}

/**
 * Returns index (0 = SEN .. 6 = MIN) for a date inside the week, or -1 if outside.
 */
export function getDayIndexInWeek(dateStr: string, mondayStr: string): number {
  const target = normalizeDateOnly(dateStr);
  const sundayStr = getSundayOfMonday(mondayStr);
  if (target < mondayStr || target > sundayStr) return -1;

  const [y1, m1, d1] = mondayStr.split('-').map(Number);
  const monDate = new Date(y1, m1 - 1, d1, 12, 0, 0);

  const [y2, m2, d2] = target.split('-').map(Number);
  const targetDate = new Date(y2, m2 - 1, d2, 12, 0, 0);

  const diffTime = targetDate.getTime() - monDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 6 ? diffDays : -1;
}

/**
 * Collects a comprehensive, deduplicated list of available weeks (current + past + existing data)
 * sorted in descending order (newest first).
 */
export function getAvailableWeeksList(
  dutyDates: string[] = [],
  extraMondayKeys: string[] = []
): { mondayStr: string; label: string; isCurrent: boolean }[] {
  const currentMonday = getMondayOfDate(new Date());
  const mondaysSet = new Set<string>();

  // Always include current running week
  mondaysSet.add(currentMonday);

  // Include recent 4 weeks before current
  for (let i = 1; i <= 4; i++) {
    mondaysSet.add(shiftWeekMonday(currentMonday, -i));
  }

  // Include any weeks found in duty logs
  dutyDates.forEach((raw) => {
    if (raw) {
      const mon = getMondayOfDate(raw);
      mondaysSet.add(mon);
    }
  });

  // Include any extra keys
  extraMondayKeys.forEach((k) => {
    if (k && /^\d{4}-\d{2}-\d{2}$/.test(k)) {
      mondaysSet.add(getMondayOfDate(k));
    }
  });

  // Sort descending
  const sorted = Array.from(mondaysSet).sort((a, b) => b.localeCompare(a));

  return sorted.map((mon) => ({
    mondayStr: mon,
    label: formatWeekRangeDisplay(mon),
    isCurrent: mon === currentMonday,
  }));
}
