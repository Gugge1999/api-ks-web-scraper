'use strict';
const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');
const config = require('../../config/scraper_config');
const notification = require('./notification.service');
const time = require('./time-and-date.service');
const logger = require('./logger.service');
const database = require('../database/db');

async function getWatch(uri) {
  const response = await rp({
    uri: uri,
  });

  const $ = cheerio.load(response);
  const watchName = $('.contentRow-title')
    .children()
    .first()
    .text()
    .replace(/Tillbakadragen|Avslutad|Säljes|OHPF|Bytes|\//gi, '') // Remove sale status of the watch
    .trim();
  if (watchName === '') throw new Error('Watch name not found');

  const poster = $('.username').first().text();

  const watchLink = $('.contentRow-title').children().first().attr('href');

  let watchInfo = `${watchName} ${poster} https://klocksnack.se${watchLink}`;
  return watchInfo;
}

async function run() {
  let allWatches = database.getAllWatches();
  console.log('Label test: ' + allWatches[0].label);

  database.updateStoredWatch(
    'ingen funktion kallad test',
    'bb1e54f4-7c0c-45f1-9d48-c5fb57a4efc7'
  );

  // För att loopa över alla klockor i data.json
  let storedWatches = JSON.parse(fs.readFileSync('src/data/data.json'));

  for (var i of Object.keys(storedWatches.watches)) {
    let currentWatch = storedWatches.watches[i];

    if (currentWatch.isActive === false) {
      continue;
    }

    try {
      let scrapedWatchObj = {
        watch: '',
      };
      function sleep() {
        console.log(`Timeout on watch: ${currentWatch.label}`);
      }
      // Timeout kan vara bra för att undvika för många requests...
      setTimeout(sleep, Math.random() * 1000 + 1000); // mellan och 1 och 2 sekunder

      scrapedWatchObj.watch = await getWatch(currentWatch.uri);

      let scrapedWatch = JSON.stringify(scrapedWatchObj, null, 4);
      let storedWatch = fs.readFileSync('src/data/stored_watch.json', 'utf8');
      const colors = {
        blue: '\x1b[36m',
        yellow: '\x1b[33m',
        green: '\x1b[32m',
        white: '\x1b[0m',
      };
      const line =
        colors.blue + '-'.repeat(process.stdout.columns) + colors.white;

      console.log(line);
      console.log(`${colors.green}Time: ${time.currentTime()}${colors.white}`);
      console.log(`${colors.yellow}Scraped${colors.white}: ${scrapedWatch}`);
      console.log(`${colors.yellow}Data stored${colors.white}: ${storedWatch}`);
      console.log(`${line}\n`);

      if (currentWatch.storedWatch != scrapedWatch) {
        let emailText = `${
          scrapedWatchObj.watch
        }\n\nDetta mail skickades: ${time.currentTime()}`;
        //await notification.sendKernelNotification(emailText);
        console.log(`Email sent ${time.currentTime()}`);

        // OM DET KRÅNGLAR ATT SKRIVA TILL FIL TESTA BYT TILL writeFileSync = inte async
        fs.writeFile(
          'src/data/stored_watch.json',
          JSON.stringify(scrapedWatchObj, null, 4),
          // Behövs function (err)?
          function (err) {
            if (err) {
              logger.error({
                message: `Write to stored watch file failed.`,
                stacktrace: err,
              });
              throw err;
            }
            console.log('Wrote to stored_watch.json successfully');
          }
        );

        // Email logging
        fs.appendFile(
          'src/logs/email_logs.txt',
          `Email sent: ${time.currentTime()}\nWatch name & date: ${
            scrapedWatchObj.watch
          }\n\n`,
          function (err) {
            if (err) {
              logger.error({
                message: `Email logging failed.`,
                stacktrace: err,
              });
              throw err;
            }
            console.log('Wrote successfully to email_logs.txt');
          }
        );
      }
      if (parseInt(i) + 1 == storedWatches.watches.length) {
        // Tror att det kommer funka... Testa med typ 30 s
        setTimeout(run, config.interval);
      }
    } catch (err) {
      logger.error({
        message: `Exit application if something went wrong.`,
        stacktrace: err,
      });
      // Exit application if something went wrong
      try {
        //await notification.sendErrorNotification(err);
      } catch (err) {
        logger.error({
          message: `Sending sendErrorNotification failed.`,
          stacktrace: err,
        });
        console.error('Sending error notification failed!');
      }
      console.error(err);
      console.log('Program exit');
      process.exitCode = 1;
    }
  }
}

module.exports = {
  getWatch,
  run,
};
