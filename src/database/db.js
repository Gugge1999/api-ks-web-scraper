'use strict';
const { v4: uuidv4 } = require('uuid');
const db = require('better-sqlite3')('src/data/watch-scraper.db', {
  fileMustExist: true,
});

const timeService = require('../services/time-and-date.service');
const scraperService = require('../services/scraper.service');
const logger = require('../services/logger.service');
const notificationService = require('../services/notification.service');
const config = require('../../config/scraper.config');

async function getAllWatches() {
  const allWatches = db.prepare('SELECT * FROM Watches').all();
  const newArr = allWatches.map((obj, i) => ({
    ...obj,
    active: JSON.parse(obj.active),
  }));
  return newArr;
}

async function updateActiveStatus(isActive, id) {
  try {
    db.prepare('UPDATE Watches SET active = ? WHERE id = ?').run(
      isActive.toString(),
      id
    );
  } catch (err) {
    logger.error({
      message: `updateActiveStatus() failed.`,
      stacktrace: err,
    });
  }
}

async function addNewWatch(label, uri) {
  try {
    // Ändra till egen service. Nånting krånglar med async / await...
    let watchInfo = await scraperService.scrapeWatchInfo(uri);

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
      uri: uri,
      label: label,
      stored_watch: `${watchInfo.watchName} ${watchInfo.poster}`, // Unique enough?
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

async function updateStoredWatch(newStoredWatch, linkToWatch, id) {
  try {
    db.prepare(
      'UPDATE Watches SET ' +
        'stored_watch = ?, ' +
        'link_to_stored_watch = ?, ' +
        'last_email_sent = ? ' +
        'WHERE id = ? '
    ).run(newStoredWatch, linkToWatch, timeService.dateAndTime(), id);
  } catch (err) {
    logger.error({
      message: `updateStoredWatch() failed.`,
      stacktrace: err,
    });
  }
}

async function deleteWatch(id) {
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

// Flytta till scraper serivce. Se upp för circle dependencies
async function scrapeAllWatches() {
  console.log(`Start scrape at: ${timeService.currentTime()}`);
  const allWatches = await getAllWatches();
  for (let i = 0; i < allWatches.length; i++) {
    const storedWatch = allWatches[i];

    if (storedWatch.active === false) {
      continue;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(`Testing purposes... ${storedWatch.added}`);
    let scrapedWatch = await scraperService.scrapeWatchInfo(storedWatch.uri);
    if (
      storedWatch.stored_watch !=
      `${scrapedWatch.watchName} ${scrapedWatch.poster}`
    ) {
      await updateStoredWatch(
        `${scrapedWatch.watchName} ${scrapedWatch.poster}`,
        scrapedWatch.watchLink,
        storedWatch.id
      );

      let emailText = `${
        scrapedWatch.watchName
      }\n\nDetta mail skickades: ${timeService.currentTime()}`;
      // await notificationService.sendKernelNotification(emailText);

      // Kom att skicka en error notification
    }
  }
  console.log(`End scrape at: ${timeService.currentTime()}`);
  setTimeout(scrapeAllWatches, config.interval);
}

function backupDatebase() {
  db.backup(`src/data/backup-watch-scraper-${timeService.todaysDate()}.db`)
    .then(() => {
      console.log('backup complete!');
    })
    .catch((err) => {
      console.log('backup failed:', err);
    });
}

module.exports = {
  getAllWatches,
  addNewWatch,
  updateActiveStatus,
  updateStoredWatch,
  deleteWatch,
  scrapeAllWatches,
};
