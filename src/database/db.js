'use strict';
const time = require('../services/time-and-date.service');
const { v4: uuidv4 } = require('uuid');
const scraper = require('../services/scraper.service');
const rp = require('request-promise');
const cheerio = require('cheerio');
const db = require('better-sqlite3')('src/watch-scraper.db', {
  fileMustExist: true,
});
const logger = require('../services/logger.service');

async function scrapeWatchInfo(uri) {
  let watchInfo = {
    watchName: '',
    poster: '',
    watchLink: '',
  };
  const response = await rp({
    uri: uri,
  });

  const $ = cheerio.load(response);
  watchInfo.watchName = $('.contentRow-title')
    .children()
    .first()
    .text()
    .replace(/Tillbakadragen|Avslutad|Säljes|OHPF|Bytes|\//gi, '') // Remove sale status of the watch
    .trim();
  if (watchInfo.watchName === '') throw new Error('Watch name not found');

  watchInfo.poster = $('.username').first().text();

  watchInfo.watchLink = `https://klocksnack.se${$('.contentRow-title')
    .children()
    .first()
    .attr('href')}`;

  return watchInfo;
}

function getAllWatches() {
  const allWatches = db.prepare('SELECT * FROM Watches').all();
  const newArr = allWatches.map((obj, i) => ({
    ...obj,
    active: JSON.parse(obj.active),
  }));
  return newArr;
}

async function updateIsActive(isActive, id) {
  try {
    db.prepare('UPDATE Watches SET active = ? WHERE id = ?').run(
      isActive.toString(),
      id
    );
  } catch (err) {
    logger.error({
      message: `updateIsActive() failed.`,
      stacktrace: err,
    });
  }
}

async function addNewWatch(label, uri) {
  try {
    // Ändra till egen service. Nånting krånglar med async / await...
    let watchInfo = await scrapeWatchInfo(uri);
    scrapeAllWatches();

    const stmt = db.prepare(
      'INSERT INTO Watches VALUES (' +
        '@id,' +
        '@uri,' +
        '@label, ' +
        '@stored_watch, ' +
        '@link_to_stored_watch, ' +
        '@scraped_watch, ' +
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

async function updateStoredWatch(newWatch, id) {
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

async function scrapeAllWatches() {
  //const allWatches = getAllWatches();
  // for (let i = 0; i < allWatches.length; i++) {
  //   const storedWatch = allWatches[i];
  //   if (storedWatch.active === 'false') {
  //     continue;
  //   }
  //   setTimeout(() => {
  //     console.log(`Timeout kan vara bra för att undvika för många requests`);
  //   }, Math.random() * 500 + 500);
  //   let scrapedWatch = await scrapeWatchInfo(storedWatch.uri);
  //   if (
  //     storedWatch.stored_watch !=
  //     `${scrapedWatch.watchName} ${scrapedWatch.poster}`
  //   ) {
  //     // Uppdatera allt som ska uppdateras
  //   }
  // }
  // Sudo kod:
  // Loopa genom alla klockor i allWatches som har active = true
  // för varje klocka anropa scrapeWatchInfo (random delay mellan 0.5 och 1 sekund)
  // kolla om allWatches[i].stored_watch skiljer sig från watchInfo.watchName + watchInfo.poster ( från scrapeWatchInfo )
  //
  // Om det skiljer sig: uppdatera stored_watch, link_to_stored_watch, last_email_sent
  // Skicka email till användare
  //
  //
}

module.exports = {
  getAllWatches,
  addNewWatch,
  updateIsActive,
  updateStoredWatch,
  deleteWatch,
  scrapeAllWatches,
};
