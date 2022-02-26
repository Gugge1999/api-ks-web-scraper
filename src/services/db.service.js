import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';

import * as timeService from './time-and-date.service.js';
import logger from './logger.service.js';
import { scrapeWatchInfo } from './scraper.service.js';

const db = new Database('src/data/watch-scraper.db', {
  fileMustExist: true,
});

export function getAllWatches() {
  try {
    const allWatches = db.prepare('SELECT * FROM Watches').all();

    // Convert column active from string to boolean
    const newArr = allWatches.map((obj) => ({
      ...obj,
      active: JSON.parse(obj.active),
    }));

    return newArr;
  } catch (err) {
    logger.error({
      message: `getAllWatches() failed.`,
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
    logger.error({
      message: `updateActiveStatus() failed.`,
      stacktrace: err,
    });
  }
}

export async function addNewWatch(label, uri) {
  try {
    const watchInfo = await scrapeWatchInfo(uri);

    const stmt = db.prepare(
      'INSERT INTO Watches VALUES (' +
        '@id,' +
        '@uri,' +
        '@label, ' +
        '@stored_watch, ' +
        '@link_to_stored_watch, ' +
        '@active, ' +
        '@last_email_sent, ' +
        '@added)'
    );

    stmt.run({
      id: uuidv4(),
      uri,
      label,
      stored_watch: `${watchInfo.watchName} ${watchInfo.uploadDate}`,
      link_to_stored_watch: watchInfo.watchLink,
      active: 'true',
      last_email_sent: '',
      added: timeService.dateAndTime(),
    });
  } catch (err) {
    logger.error({
      message: `addNewWatch() failed.`,
      stacktrace: err,
    });
  }
}

export function updateStoredWatch(newStoredWatch, newLinkToWatch, id) {
  try {
    const stmt = db.prepare(
      'UPDATE Watches SET ' +
        'stored_watch = @stored_watch, ' +
        'link_to_stored_watch = @link_to_stored_watch, ' +
        'last_email_sent = @last_email_sent ' +
        'WHERE id = @id '
    );

    stmt.run({
      stored_watch: newStoredWatch,
      link_to_stored_watch: newLinkToWatch,
      last_email_sent: timeService.dateAndTime(),
      id,
    });
  } catch (err) {
    logger.error({
      message: `updateStoredWatch() failed.`,
      stacktrace: err,
    });
  }
}

export function deleteWatch(id) {
  try {
    const stmt = db.prepare('DELETE FROM Watches WHERE id = ?');

    stmt.run(id);
  } catch (err) {
    logger.error({
      message: `deleteWatch() failed.`,
      stacktrace: err,
    });
  }
}

export function backupDatebase() {
  db.backup(`src/data/backup-watch-scraper-${timeService.todaysDate()}.db`)
    .then(() => {
      console.log('backup complete!');
    })
    .catch((err) => {
      console.log('backup failed:', err);
    });
}
