import { formatInTimeZone } from 'date-fns-tz/esm';

const timeZone = 'Europe/Stockholm';

/**
 * @return k:mm:ss.
 */
export function currentTime() {
  return formatInTimeZone(new Date(), timeZone, 'k:mm:ss');
}

/**
 * @return yyyy-MM-dd k:mm:ss.
 */
export function dateAndTime() {
  return formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd k:mm:ss');
}

/**
 * @return k:mm:ss yyyy-MM-dd.
 */
export function dateAndTimeWithTimeFirst() {
  return formatInTimeZone(new Date(), timeZone, 'k:mm:ss yyyy-MM-dd');
}

/**
 * @return yyyy-MM-dd.
 */
export function todaysDate() {
  return formatInTimeZone(new Date(), timeZone, '', 'yyyy-MM-dd');
}
