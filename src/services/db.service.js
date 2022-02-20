'use strict';
const { v4: uuidv4 } = require('uuid');
const db = require('better-sqlite3')('src/data/watch-scraper.db', {
  fileMustExist: true,
});

const timeService = require('./time-and-date.service');
const logger = require('./logger.service');
const notificationService = require('./notification.service');
const scraperService = require('./scraper.service');
const config = require('../../config/scraper.config');

async function getAllWatches() {
  try {
    const allWatches = db.prepare('SELECT * FROM Watches').all();

    // Convert column active from string to boolean
    const newArr = allWatches.map((obj, i) => ({
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

async function updateActiveStatus(isActive, id) {
  try {
    const stmt = db.prepare(
      'UPDATE Watches SET active = @active WHERE id = @id'
    );

    stmt.run({
      active: isActive.toString(),
      id: id,
    });
  } catch (err) {
    logger.error({
      message: `updateActiveStatus() failed.`,
      stacktrace: err,
    });
  }
}

async function addNewWatch(label, uri) {
  try {
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
      stored_watch: `${watchInfo.watchName} ${watchInfo.poster}`, // Unique enough? Kanske bättre att köra namn + datum när annonsen laddades upp. Det går att få tag på datum även om det står idag.
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

async function updateStoredWatch(newStoredWatch, newLinkToWatch, id) {
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
      id: id,
    });
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

// Flytta till scraper service
async function scrapeAllWatches() {
  console.log(`Start scrape at: ${timeService.currentTime()}`);
  const allWatches = await getAllWatches();
  for (let i = 0; i < allWatches.length; i++) {
    const storedWatch = allWatches[i];

    if (storedWatch.active === false) continue;

    await new Promise((resolve) => setTimeout(resolve, 1000));

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
  console.log(`End scrape at:   ${timeService.currentTime()}`);
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
  backupDatebase,
};
