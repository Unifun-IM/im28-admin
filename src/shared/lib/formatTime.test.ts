import {
  DATE_TIME_FORMAT_12H,
  DATE_TIME_FORMAT_24H,
  formatDateTime,
  getDateTimeFormat,
  setTimeFormatPreference
} from './formatTime';

describe('formatTime', () => {
  afterEach(() => {
    setTimeFormatPreference('24h');
  });

  it('uses the configured time format preference', () => {
    setTimeFormatPreference('12h');

    expect(getDateTimeFormat()).toBe(DATE_TIME_FORMAT_12H);
    expect(formatDateTime('2026-08-24T13:05:00')).toContain('01:05:00 PM');

    setTimeFormatPreference('24h');

    expect(getDateTimeFormat()).toBe(DATE_TIME_FORMAT_24H);
    expect(formatDateTime('2026-08-24T13:05:00')).toContain('13:05:00');
  });

  it('keeps explicit formats independent from the global preference', () => {
    setTimeFormatPreference('12h');

    expect(formatDateTime('2026-08-24T13:05:00', 'HH:mm')).toBe('13:05');
  });
});
