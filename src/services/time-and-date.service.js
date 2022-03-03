export function currentTime() {
  return new Date().toLocaleTimeString('sv-SE');
  // Format: hh:mm:ss
}

export function dateAndTime() {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'Europe/Stockholm',
  });
  // Format: yyyy-mm-dd hh:mm:ss
}

export function dateAndTimeDashed() {
  return `${todaysDate()}-at-${new Date()
    .toLocaleTimeString('sv-SE')
    .replaceAll(':', '-')}`;
  // Format: yyyy-mm-dd-at-hh-mm-ss
}

export function todaysDate() {
  return new Date().toISOString().slice(0, 10);
  // Format: yyyy-mm-dd
}
