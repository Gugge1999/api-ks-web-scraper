import { DateTime } from "luxon";

// Tabell över format: https://moment.github.io/luxon/#/formatting

/**
 * Format: yyyy-MM-dd hh:mm:ss.
 */
export function dateAndTime() {
  const dt = DateTime.now();

  return dt.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS);
}

/**
 * Format: hh:mm:ss.
 */
export function time() {
  return DateTime.now().toLocaleString(DateTime.TIME_24_WITH_SECONDS);
}
