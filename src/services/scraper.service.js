import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

import { interval } from '../config/scraper.config.js';
import {
  sendKernelNotification,
  sendErrorNotification,
} from './notification.service.js';
import * as timeService from './time-and-date.service.js';
import { updateStoredWatch, getAllWatches } from './db.service.js';
import { errorLogger } from './logger.service.js';

export async function scrapeWatchInfo(link) {
  const watchInfo = {
    watchName: '',
    postedDate: '',
    watchLink: '',
  };

  const response = await fetch(link);
  const body = await response.text();

  const $ = cheerio.load(body);

  watchInfo.watchName = $('.contentRow-title')
    .children()
    .first()
    .text()
    .replace(/Tillbakadragen|Avslutad|Säljes|OHPF|Bytes|\//gi, '')
    .trim();

  if (watchInfo.watchName === '') {
    errorLogger.error({ message: 'Watch name not found' });
    throw new Error();
  }

  // Format: 24 Februari 2022 kl 18:12
  // attr "datetime" finns också. Format: 2022-02-24T18:12:49+0100
  watchInfo.postedDate = $('.u-dt').attr('title');

  watchInfo.watchLink = `https://klocksnack.se${$('.contentRow-title')
    .children()
    .first()
    .attr('href')}`;

  return watchInfo;
}

export async function scrapeAllWatches() {
  const allWatches = getAllWatches();

  const activeWatches = allWatches.filter((w) => w.active === true);

  console.log(
    `Scraping ${activeWatches.length} ${
      activeWatches.length === 1 ? 'watch' : 'watches'
    } @ ${timeService.currentTime()}`
  );
  for (let i = 0; i < allWatches.length; i += 1) {
    const storedWatch = allWatches[i];

    if (storedWatch.active === false) {
      continue;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const scrapedWatch = await scrapeWatchInfo(storedWatch.link);
    if (
      `${storedWatch.watch_name} ${storedWatch.watch_posted}` !==
      `${scrapedWatch.watchName} ${scrapedWatch.postedDate}`
    ) {
      updateStoredWatch(
        scrapedWatch.watchName,
        scrapedWatch.postedDate,
        scrapedWatch.watchLink,
        storedWatch.id
      );

      const emailText = `${
        scrapedWatch.watchName
      }\n\nDetta mail skickades: ${timeService.dateAndTime()}`;
      try {
        // await sendKernelNotification(emailText);
        // console.log('Email sent.');
        // Skriv till databas om när ett mail skickades.
      } catch (err) {
        // await sendErrorNotification(err);
        errorLogger.error({
          message: 'Function sendErrorNotification failed.',
          stacktrace: err,
        });
      }
    }
  }
  setTimeout(scrapeAllWatches, interval);
}
