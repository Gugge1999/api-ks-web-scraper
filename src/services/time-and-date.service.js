import { format } from 'date-fns';

export function currentTime() {
  return format(new Date(), 'k:mm:ss');
}

export function dateAndTime() {
  return format(new Date(), 'yyyy-MM-dd k:mm:ss');
}

export function todaysDate() {
  return format(new Date(), 'yyyy-MM-dd');
}
