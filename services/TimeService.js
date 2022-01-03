"use strict";

module.exports = {
  getTime() {
    return new Date().toLocaleString();
  },

  getDateAndTime() {
    let datetime = new Date().toLocaleString("sv-SE", {
      timeZone: "Europe/Stockholm",
    });
    return datetime;
  },
};
