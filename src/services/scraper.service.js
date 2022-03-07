import fetch from 'node-fetch';
import cheerio from 'cheerio';

import { interval } from '../config/scraper.config.js';
import {
  sendKernelNotification,
  sendErrorNotification,
} from './notification.service.js';
import * as timeService from './time-and-date.service.js';
import { updateStoredWatch, getAllWatches } from './db.service.js';
import { logger } from './logger.service.js';

export async function scrapeWatchInfo(uri) {
  const watchInfo = {
    watchName: '',
    postedDate: '',
    watchLink: '',
  };

  const response = await fetch(uri);
  const body = await response.text();

  const $ = cheerio.load(body);

  watchInfo.watchName = $('.contentRow-title')
    .children()
    .first()
    .text()
    .replace(/Tillbakadragen|Avslutad|Säljes|OHPF|Bytes|\//gi, '')
    .trim();

  if (watchInfo.watchName === '') {
    logger.error({ message: 'Watch name not found' });
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
  console.log(`Scraping all watches @ ${timeService.currentTime()}`);
  const allWatches = getAllWatches();
  for (let i = 0; i < allWatches.length; i += 1) {
    const storedWatch = allWatches[i];

    if (storedWatch.active === false) {
      continue;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const scrapedWatch = await scrapeWatchInfo(storedWatch.uri);
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
        //await sendKernelNotification(emailText);
        //console.log('Email sent.');
      } catch (err) {
        //await sendErrorNotification(err);
        logger.error({
          message: 'Function sendErrorNotification failed.',
          stacktrace: err,
        });
      }
    }
  }
  setTimeout(scrapeAllWatches, interval);
}
