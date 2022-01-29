'use strict';

module.exports = {
  currentTime() {
    return new Date().toLocaleString();
  },
  dateAndTime() {
    return new Date().toLocaleString('sv-SE', {
      timeZone: 'Europe/Stockholm',
    });
  },
};
