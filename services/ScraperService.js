'use strict';
const fs = require('fs');
const rp = require('request-promise');
const cheerio = require('cheerio');
const config = require('../config/scraper_config');
const NotificationService = require('./NotificationService');
const TimeService = require('./TimeService');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  format: combine(timestamp(), prettyPrint()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/ks_web_scraper.log' }),
  ],
});

async function getWatch() {
  const response = await rp({
    uri: config.uri,
  });

  const $ = cheerio.load(response);
  const watchName = $('.contentRow-title')
    .children()
    .first()
    .text()
    .replace(/Tillbakadragen|Avslutad|Säljes|OHPF|Bytes|\//gi, '') // Remove sale status of the watch
    .trim();
  if (watchName === '') throw new Error('Watch name not found');

  const date = $('.u-dt').attr('data-date-string');

  const watchLink = $('.contentRow-title').children().first().attr('href');

  let watchInfo = `${watchName} ${date} https://klocksnack.se${watchLink}`;
  return watchInfo;
}

async function run() {
  let watchObj = {
    watch: '',
  };

  try {
    watchObj.watch = await getWatch();
    let scrapedWatch = JSON.stringify(watchObj, null, 4);
    let storedWatch = fs.readFileSync('data/stored_watch.json', 'utf8');
    const colors = {
      blue: '\x1b[36m',
      yellow: '\x1b[33m',
      green: '\x1b[32m',
      white: '\x1b[0m',
    };
    const line =
      colors.blue + '-'.repeat(process.stdout.columns) + colors.white;

    console.log(line);
    console.log(`${colors.green}Time: ${TimeService.getTime()}${colors.white}`);
    console.log(`${colors.yellow}Scraped${colors.white}: ${scrapedWatch}`);
    console.log(`${colors.yellow}Data stored${colors.white}: ${storedWatch}`);
    console.log(`${line}\n`);

    if (storedWatch != scrapedWatch) {
      let emailText = `${
        watchObj.watch
      }\n\nDetta mail skickades: ${TimeService.getTime()}`;
      //await NotificationService.sendKernelNotification(emailText);
      console.log(
        `Time with milliseconds after sending email: ${TimeService.getDateAndTime()}`
      );
      console.log(`Email sent ${TimeService.getTime()}`);

      // Write to stored watch file
      fs.writeFile(
        'data/stored_watch.json',
        JSON.stringify(watchObj, null, 4),
        function (err) {
          if (err) {
            logger.log({
              level: 'error',
              message: `Write to stored watch file failed. Error Message: ${err.message}`,
            });
            throw err;
          }
          console.log('Wrote to stored_watch.json successfully');
        }
      );

      // Email logging
      fs.appendFile(
        'logs/email_logs.txt',
        `Email sent: ${TimeService.getTime()}\nWatch name & date: ${
          watchObj.watch
        }\n\n`,
        function (err) {
          if (err) {
            logger.log({
              level: 'error',
              message: `Email logging failed. Error Message: ${err.message}`,
            });
            throw err;
          }
          console.log('Wrote successfully to email_logs.txt');
        }
      );
    }
    setTimeout(run, config.interval);
  } catch (err) {
    logger.log({
      level: 'error',
      message: `Exit application if something went wrong. Error Message: ${err.message}`,
    });
    // Exit application if something went wrong
    try {
      //await NotificationService.sendErrorNotification(err);
    } catch (err) {
      logger.log({
        level: 'error',
        message: `Sending sendErrorNotification failed. Error Message: ${err.message}`,
      });
      console.error('Sending error notification failed!');
    }
    console.error(err);
    console.log('Program exit');
    process.exitCode = 1;
  }
}

module.exports = {
  getWatch,
  run,
};
