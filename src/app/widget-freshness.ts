// When a dashboard widget runs its workspace by itself (phase 23): when it has no value, or its value is older than an
// hour. A workspace is tried at most once an hour, so one that fails is not run again on every reload of the widget.

export const MAX_WIDGET_AGE_MS = 60 * 60 * 1000;

export const needsWidgetRun = (entry: { at: string } | undefined, now: number): boolean => {
  if (!entry) return true;
  const at = Date.parse(entry.at);
  if (Number.isNaN(at)) return true;
  return now - at > MAX_WIDGET_AGE_MS;
};

const attempts = new Map<string, number>();

export const attemptAllowed = (id: string, now: number): boolean => {
  const last = attempts.get(id);
  return last === undefined || now - last > MAX_WIDGET_AGE_MS;
};

export const markAttempt = (id: string, now: number): void => {
  attempts.set(id, now);
};

export const resetAttempts = (): void => attempts.clear();
