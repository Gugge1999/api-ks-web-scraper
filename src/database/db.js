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

function getAllWatches() {
  const allWatches = db.prepare('SELECT * FROM Watches').all();
  return allWatches;
}

async function getWatch(uri) {
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

async function addNewWatch(label, uri) {
  try {
    // Ändra till egen service. Nånting krånglar med async / await...
    let watchInfo = await getWatch(uri);

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
