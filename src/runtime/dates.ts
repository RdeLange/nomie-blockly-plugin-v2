// Day helpers in the local time zone. v1 used toISOString(), which gives the UTC day: near midnight outside UTC
// that is the wrong day, so "today" and "yesterday" could point at the wrong date.

const pad = (n: number) => String(n).padStart(2, '0');

// 'YYYY-MM-DD' for the local day of the date
export const localDayKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// The local midnight at the start of a 'YYYY-MM-DD' day
export const parseDayKey = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

// The day a block asks for: 'today' or 'yesterday', relative to the day the run is for.
export const resolveDay = (day: string, runDay: Date): string => {
  if (day === 'today') return localDayKey(runDay);
  if (day === 'yesterday') return localDayKey(addDays(runDay, -1));
  return day;
};
