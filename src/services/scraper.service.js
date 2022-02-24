import fetch from 'node-fetch';
import cheerio from 'cheerio';

import { interval } from '../../config/scraper.config.js';
import {
  sendKernelNotification,
  sendErrorNotification,
} from './notification.service.js';
import * as timeService from './time-and-date.service.js';
import { updateStoredWatch, getAllWatches } from './db.service.js';
import logger from './logger.service.js';

export async function scrapeWatchInfo(uri) {
  const watchInfo = {
    watchName: '',
    poster: '',
    watchLink: '',
  };

  const response = await fetch(uri);
  const body = await response.text();

  const $ = cheerio.load(body);

  watchInfo.watchName = $('.contentRow-title')
    .children() // kan chrildren tas bort?
    .first() // Kan first tas bort?
    .text()
    .replace(/Tillbakadragen|Avslutad|Säljes|OHPF|Bytes|\//gi, '') // Remove sale status of the watch
    .trim();

  if (watchInfo.watchName === '') {
    logger.error({ message: 'Watch name not found' });
    throw new Error();
  }

  watchInfo.poster = $('.username').first().text();

  watchInfo.watchLink = `https://klocksnack.se${$('.contentRow-title')
    .children()
    .first()
    .attr('href')}`;

  return watchInfo;
}

export async function scrapeAllWatches() {
  const allWatches = await getAllWatches();
  for (let i = 0; i < allWatches.length; i += 1) {
    const storedWatch = allWatches[i];

    if (storedWatch.active === false) {
      continue;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const scrapedWatch = await scrapeWatchInfo(storedWatch.uri);
    if (
      storedWatch.stored_watch !==
      `${scrapedWatch.watchName} ${scrapedWatch.poster}`
    ) {
      await updateStoredWatch(
        `${scrapedWatch.watchName} ${scrapedWatch.poster}`,
        scrapedWatch.watchLink,
        storedWatch.id
      );

      const emailText = `${
        scrapedWatch.watchName
      }\n\nDetta mail skickades: ${timeService.currentTime()}`;
      try {
        await sendKernelNotification(emailText);
        console.log('Email sent.');
      } catch (err) {
        await sendErrorNotification(err);
        logger.error({
          message: 'sendErrorNotification failed.',
          stacktrace: err,
        });
      }
    }
  }
  setTimeout(scrapeAllWatches, interval);
}
