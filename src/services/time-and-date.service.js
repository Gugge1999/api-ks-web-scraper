'use strict';

function currentTime() {
  return new Date().toLocaleString();
}

function dateAndTime() {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'Europe/Stockholm',
  });
}

module.exports = {
  currentTime,
  dateAndTime,
};
