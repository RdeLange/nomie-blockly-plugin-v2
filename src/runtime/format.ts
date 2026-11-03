// How a value from a workspace is written into a note, a message or the console.
// Lists keep the format v2 wrote before (1,2), so a workspace that logs a list writes the same note as before.
export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : formatValue(item))).join(',');
  if (value instanceof Date) return value.toString();
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};
