// A dashboard widget runs its workspace by itself when its value is missing or old (phase 23), and a workspace is
// tried again at most once an hour, so a workspace that fails is not run every time the widget reloads.
import { describe, expect, it } from 'vitest';
import { needsWidgetRun, MAX_WIDGET_AGE_MS, attemptAllowed, markAttempt, resetAttempts } from './widget-freshness';

const NOW = Date.parse('2026-11-05T10:00:00Z');

describe('when a dashboard widget runs', () => {
  it('runs when it has no value yet', () => {
    expect(needsWidgetRun(undefined, NOW)).toBe(true);
  });

  it('runs when its value is older than an hour', () => {
    expect(needsWidgetRun({ at: new Date(NOW - MAX_WIDGET_AGE_MS - 1000).toISOString() }, NOW)).toBe(true);
  });

  it('does not run when its value is fresh', () => {
    expect(needsWidgetRun({ at: new Date(NOW - 5 * 60_000).toISOString() }, NOW)).toBe(false);
  });

  it('runs when the time it was set is not a time', () => {
    expect(needsWidgetRun({ at: 'nonsense' }, NOW)).toBe(true);
  });
});

describe('how often a workspace is tried', () => {
  it('is tried again only after an hour', () => {
    resetAttempts();
    expect(attemptAllowed('w', NOW)).toBe(true);
    markAttempt('w', NOW);
    expect(attemptAllowed('w', NOW + 10 * 60_000)).toBe(false);
    expect(attemptAllowed('w', NOW + MAX_WIDGET_AGE_MS + 1)).toBe(true);
  });

  it('is kept per workspace', () => {
    resetAttempts();
    markAttempt('w', NOW);
    expect(attemptAllowed('other', NOW)).toBe(true);
  });
});
