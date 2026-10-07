export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function getRelativeDateLabel(dateKey: string): string {
  const todayKey = getTodayKey();
  if (dateKey === todayKey) return 'Today';

  const date = parseDateKey(dateKey);
  const today = parseDateKey(todayKey);
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function getWeekDays(referenceDateKey: string = getTodayKey()): { key: string; date: Date; dayName: string; dayNumber: number; isToday: boolean }[] {
  const refDate = parseDateKey(referenceDateKey);
  const currentDay = refDate.getDay(); // 0 is Sun, 1 is Mon...
  // Let week start on Monday (ISO week)
  const distanceToMonday = (currentDay + 6) % 7;
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() - distanceToMonday);

  const todayKey = getTodayKey();
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = formatDateKey(d);
    days.push({
      key,
      date: d,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: key === todayKey,
    });
  }

  return days;
}

export function getMonthDays(year: number, month: number): { key: string; date: Date; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const todayKey = getTodayKey();

  const days: { key: string; date: Date; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

  // Pad beginning of month to Monday
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  for (let i = startDayOfWeek; i > 0; i--) {
    const prevDate = new Date(year, month, 1 - i);
    const key = formatDateKey(prevDate);
    days.push({
      key,
      date: prevDate,
      dayNumber: prevDate.getDate(),
      isCurrentMonth: false,
      isToday: key === todayKey,
    });
  }

  // Days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i);
    const key = formatDateKey(date);
    days.push({
      key,
      date,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: key === todayKey,
    });
  }

  // Pad end of month to complete rows of 7
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    const key = formatDateKey(nextDate);
    days.push({
      key,
      date: nextDate,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: key === todayKey,
    });
  }

  return days;
}

export function getPastNDays(n: number, endDate: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - i);
    keys.push(formatDateKey(d));
  }
  return keys;
}

export function getPreviousDayKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return formatDateKey(date);
}
