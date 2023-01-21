import formatInTimeZone from 'date-fns-tz/formatInTimeZone';

const timeZone = 'Europe/Stockholm';

/**
 * Format: yyyy-MM-dd k:mm:ss.
 */
export function dateAndTime() {
  return formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd k:mm:ss');
}

/**
 * Format: k:mm:ss yyyy-MM-dd.
 */
export function dateAndTimeWithTimeFirst() {
  return formatInTimeZone(new Date(), timeZone, 'k:mm:ss yyyy-MM-dd');
}
