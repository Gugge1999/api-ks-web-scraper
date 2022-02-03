'use strict';
const time = require('../services/time-and-date.service');
const { v4: uuidv4 } = require('uuid');

const db = require('better-sqlite3')('src/watch-scraper.db', {
  fileMustExist: true,
});
const logger = require('../services/logger.service');

function getAllWatches() {
  const allWatches = db.prepare('SELECT * FROM Watches').all();
  return allWatches;
}

function addNewWatch(label, uri) {
  try {
    const stmt = db.prepare(
      'INSERT INTO Watches VALUES (@id, @uri, @label, @stored_watch, @scraped_watch, @active, @last_email_sent, @added)'
    );

    stmt.run({
      id: uuidv4(),
      uri: uri,
      label: label,
      stored_watch: 'stored watch',
      scraped_watch: 'scraped watch',
      active: 'true',
      last_email_sent: '',
      added: time.dateAndTime(),
    });
  } catch (err) {
    logger.error({
      message: `addNewWatch() failed.`,
      stacktrace: err,
    });
  }
}

function updateStoredWatch(newWatch, id) {
  try {
    db.prepare('UPDATE Watches SET stored_watch = ? WHERE id = ?').run(
      newWatch,
      id
    );
  } catch (err) {
    logger.error({
      message: `updateStoredWatch() failed.`,
      stacktrace: err,
    });
  }
}

module.exports = {
  getAllWatches,
  addNewWatch,
  updateStoredWatch,
};
