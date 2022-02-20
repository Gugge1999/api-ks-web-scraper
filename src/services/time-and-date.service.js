'use strict';

function currentTime() {
  return new Date().toLocaleString();
}

function dateAndTime() {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'Europe/Stockholm',
  });
}

function todaysDate() {
  return new Date().toISOString().slice(0, 10); // Format: yyyy-mm-dd
}

module.exports = {
  currentTime,
  dateAndTime,
  todaysDate,
};
