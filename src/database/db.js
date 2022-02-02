const db = require('better-sqlite3')('src/watch-scraper.db', {
  fileMustExist: true,
});
const logger = require('../services/logger.service');

function getAllWatches() {
  const allWatches = db.prepare('SELECT * FROM Watches').all();
  return allWatches;
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
  updateStoredWatch,
};
