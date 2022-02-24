export function currentTime() {
  return new Date().toLocaleString();
}

export function dateAndTime() {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'Europe/Stockholm',
  });
}

export function todaysDate() {
  return new Date().toISOString().slice(0, 10); // Format: yyyy-mm-dd
}
