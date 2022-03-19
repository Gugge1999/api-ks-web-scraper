import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';

import * as timeService from './time-and-date.service.js';
import { errorLogger } from './logger.service.js';
import { scrapeWatchInfo } from './scraper.service.js';

const db = new Database('src/database/watch-scraper.db', {
  fileMustExist: true,
});

export function getAllWatches() {
  try {
    const allWatches = db.prepare('SELECT * FROM Watches').all();

    return convertStringToBoolean(allWatches);
  } catch (err) {
    errorLogger.error({
      message: 'Function getAllWatches failed.',
      stacktrace: err,
    });
  }
}

export function updateActiveStatus(isActive, id) {
  try {
    const stmt = db.prepare(
      'UPDATE Watches SET active = @active WHERE id = @id'
    );

    stmt.run({
      active: isActive.toString(),
      id,
    });
  } catch (err) {
    errorLogger.error({
      message: 'Function updateActiveStatus failed.',
      stacktrace: err,
    });
  }
}

export async function addNewWatch(label, uri) {
  try {
    const watchInfo = await scrapeWatchInfo(uri);

    const newWatchId = uuidv4();

    const insertStmt = db.prepare(
      'INSERT INTO Watches VALUES (' +
        '@id,' +
        '@uri,' +
        '@label, ' +
        '@watch_name, ' +
        '@watch_posted, ' +
        '@link_to_watch, ' +
        '@active, ' +
        '@last_email_sent, ' +
        '@added)'
    );

    insertStmt.run({
      id: newWatchId,
      uri,
      label,
      watch_name: watchInfo.watchName,
      watch_posted: watchInfo.postedDate,
      link_to_watch: watchInfo.watchLink,
      active: 'true',
      last_email_sent: '',
      added: timeService.dateAndTime(),
    });

    const getStmt = db.prepare('SELECT * FROM Watches WHERE ID = ?');
    const newWatch = getStmt.get(newWatchId);

    return newWatch;
  } catch (err) {
    errorLogger.error({
      message: 'Function addNewWatch failed.',
      stacktrace: err,
    });
  }
}

export function getWatchById(id) {
  const stmt = db.prepare('SELECT * FROM Watches WHERE ID = ?');
  const watch = stmt.get(id);

  return convertStringToBoolean(watch);
}

export function updateStoredWatch(watchName, watchPosted, newLinkToWatch, id) {
  try {
    const stmt = db.prepare(
      'UPDATE Watches SET ' +
        'watch_name = @watch_name, ' +
        'watch_posted = @watch_posted, ' +
        'link_to_watch = @link_to_watch, ' +
        'last_email_sent = @last_email_sent ' +
        'WHERE id = @id '
    );

    stmt.run({
      watch_name: watchName,
      watch_posted: watchPosted,
      link_to_watch: newLinkToWatch,
      last_email_sent: timeService.dateAndTime(),
      id,
    });
  } catch (err) {
    errorLogger.error({
      message: 'Function updateStoredWatch failed.',
      stacktrace: err,
    });
  }
}

export function deleteWatch(id) {
  try {
    const stmt = db.prepare('DELETE FROM Watches WHERE id = ?');

    stmt.run(id);
  } catch (err) {
    errorLogger.error({
      message: 'Function deleteWatch failed.',
      stacktrace: err,
    });
  }
}

export function backupDatebase() {
  db.backup(
    `src/database/backups/backup-watch-scraper-${timeService.todaysDate()}.db`
  )
    .then(() => {
      console.log('Backup complete!');
    })
    .catch((err) => {
      errorLogger.error({
        message: 'Function backupDatebase failed',
        stacktrace: err,
      });
    });
}

function convertStringToBoolean(array) {
  // Convert column active from string to boolean
  const newArr = array.map((obj) => ({
    ...obj,
    active: JSON.parse(obj.active),
  }));
  return newArr;
}
