import Database from 'better-sqlite3';
// @ts-ignore
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

import { scrapedWatch } from '../models/scraped-watch.js';
import { watch } from '../models/watch.js';
import { errorLogger, infoLogger } from './logger.js';
import * as timeService from './time-and-date.js';

const devEnv = 'src/database/watch-scraper.db';
const prodEnv = '/home/watch-scraper.db';

try {
  fs.copySync(devEnv, prodEnv);
  console.log('success!');
} catch (err) {
  console.error('fs error', err);
}

let db: any;

setTimeout(() => {
  db = new Database(prodEnv, {
    verbose: console.log
  });
}, 5000);

function convertStringToBoolean(array: watch[]): watch[] {
  // Convert column active from string to boolean
  return array.map((obj) => ({
    ...obj,
    active: JSON.parse(obj.active.toString())
  }));
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

export function getAllActiveWatches(): watch[] {
  try {
    const stmt = db.prepare('SELECT * FROM Watches WHERE active = @active');
    const allWatches = stmt.all({ active: 'true' });

    return convertStringToBoolean(allWatches);
  } catch (err) {
    errorLogger.error({
      message: 'Function getAllActiveWatches failed.',
      stacktrace: err
    });
    return [];
  }
}

export function getAllWatchesOnlyLatest() {
  try {
    const allWatches = db.prepare('SELECT * FROM Watches').all();

    for (let i = 0; i < allWatches.length; i += 1) {
      const firstWatchInArr = JSON.parse(allWatches[i].watches)[0];
      allWatches[i].watches = firstWatchInArr;
    }

    return convertStringToBoolean(allWatches);
  } catch (err) {
    return errorLogger.error({
      message: 'Function getAllWatchesOnlyLatest failed.',
      stacktrace: err
    });
  }
}

export function toggleActiveStatus(newStatus: boolean, id: string) {
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

export function addNewWatch(
  label: string,
  link: string,
  newScrapedWatches: scrapedWatch[]
) {
  try {
    const newWatchId = uuidv4();

    const insertStmt = db.prepare(
      'INSERT INTO Watches VALUES (' +
        '@id,' +
        '@link,' +
        '@label, ' +
        '@watches, ' +
        '@active, ' +
        '@last_email_sent, ' +
        '@added)'
    );

    const newWatchObj: watch = {
      id: newWatchId,
      link,
      label,
      watches: JSON.stringify(newScrapedWatches),
      active: 'true',
      last_email_sent: '',
      added: timeService.dateAndTime()
    };

    insertStmt.run(newWatchObj);

    newWatchObj.watches = newScrapedWatches[0];

    return newWatchObj;
  } catch (err) {
    return errorLogger.error({
      message: 'Function addNewWatch failed.',
      stacktrace: err
    });
  }
}

export function getWatchById(id: string) {
  const stmt = db.prepare('SELECT * FROM Watches WHERE ID = ?');
  const watch = stmt.get(id);

  return convertStringToBoolean(watch);
}

export function updateStoredWatches(newWatchArr: string, id: string) {
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

export function deleteWatch(id: string) {
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
    .catch((err: any) => {
      errorLogger.error({
        message: 'Function backupDatabase failed.',
        stacktrace: err
      });
    });
}
