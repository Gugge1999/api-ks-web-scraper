import { formatInTimeZone } from 'date-fns-tz/esm';

const timeZone = 'Europe/Stockholm';

export function currentTime() {
  return formatInTimeZone(new Date(), timeZone, 'k:mm:ss');
}

export function dateAndTime() {
  return formatInTimeZone(new Date(), timeZone, 'yyyy-MM-dd k:mm:ss');
}

export function todaysDate() {
  return formatInTimeZone(new Date(), timeZone, '', 'yyyy-MM-dd');
}
