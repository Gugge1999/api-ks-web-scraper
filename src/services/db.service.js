import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';

import * as timeService from './time-and-date.service.js';
import { errorLogger, infoLogger } from './logger.service.js';

const db = new Database('src/database/watch-scraper.db', {
  fileMustExist: true
});

function convertStringToBoolean(array) {
  // Convert column active from string to boolean
  return array.map((obj) => ({ ...obj, active: JSON.parse(obj.active) }));
}

export function getAllWatches() {
  try {
    const allWatches = db.prepare('SELECT * FROM Watches').all();

    return convertStringToBoolean(allWatches);
  } catch (err) {
    return errorLogger.error({
      message: 'Function getAllWatches failed.',
      stacktrace: err
    });
  }
}

export function getAllActiveWatches() {
  try {
    const stmt = db.prepare('SELECT * FROM Watches WHERE active = @active');
    const allWatches = stmt.all({ active: 'true' });

    return convertStringToBoolean(allWatches);
  } catch (err) {
    return errorLogger.error({
      message: 'Function getAllWatches failed.',
      stacktrace: err
    });
  }
}

export function toggleActiveStatus(newStatus, id) {
  try {
    const stmt = db.prepare(
      'UPDATE Watches SET active = @active WHERE id = @id'
    );

    stmt.run({
      active: newStatus.toString(),
      id
    });

    return newStatus;
  } catch (err) {
    return errorLogger.error({
      message: 'Function toggleActiveStatus failed.',
      stacktrace: err
    });
  }
}

export function addNewWatch(label, link, newWatchInfo) {
  try {
    const newWatchId = uuidv4();

    const insertStmt = db.prepare(
      'INSERT INTO Watches VALUES (' +
        '@id,' +
        '@link,' +
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
      link,
      label,
      watch_name: newWatchInfo.watchName,
      watch_posted: newWatchInfo.postedDate,
      link_to_watch: newWatchInfo.watchLink,
      active: 'true',
      last_email_sent: '',
      added: timeService.dateAndTime()
    });

    const getStmt = db.prepare('SELECT * FROM Watches WHERE ID = ?');
    const newWatch = getStmt.get(newWatchId);

    return newWatch;
  } catch (err) {
    return errorLogger.error({
      message: 'Function addNewWatch failed.',
      stacktrace: err
    });
  }
}

export function getWatchById(id) {
  const stmt = db.prepare('SELECT * FROM Watches WHERE ID = ?');
  const watch = stmt.get(id);

  return convertStringToBoolean(watch);
}

export function updateStoredWatches(newWatchArr, id) {
  try {
    const stmt = db.prepare(
      'UPDATE Watches SET ' +
        'watches = @watches, ' +
        'last_email_sent = @last_email_sent ' +
        'WHERE id = @id '
    );

    stmt.run({
      watches: newWatchArr,
      last_email_sent: timeService.dateAndTime(),
      id
    });
  } catch (err) {
    errorLogger.error({
      message: 'Function updateStoredWatch failed.',
      stacktrace: err
    });
  }
}

export function deleteWatch(id) {
  try {
    const stmt = db.prepare('DELETE FROM Watches WHERE id = ?');

    stmt.run(id);

    return id;
  } catch (err) {
    return errorLogger.error({
      message: 'Function deleteWatch failed.',
      stacktrace: err
    });
  }
}

export function backupDatabase() {
  db.backup(
    `src/database/backups/backup-watch-scraper-${timeService.todaysDate()}.db`
  )
    .then(() => {
      infoLogger.info({ message: 'Backup complete!' });
    })
    .catch((err) => {
      errorLogger.error({
        message: 'Function backupDatabase failed.',
        stacktrace: err
      });
    });
}
