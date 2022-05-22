import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

import { interval } from '../config/scraper.config.js';
import {
  sendKernelNotification,
  sendErrorNotification
} from './notification.service.js';
import * as timeService from './time-and-date.service.js';
import { updateStoredWatch, getAllWatches } from './db.service.js';
import { errorLogger, infoLogger } from './logger.service.js';

export async function scrapeWatchInfo(link) {
  const response = await fetch(link);
  const body = await response.text();

  const $ = cheerio.load(body);

  const scrapedWatchArr = [];

  const allContentRowTitle = $('.contentRow-title').children();

  for (let i = 0; i < allContentRowTitle.length; i += 1) {
    const currentWatchInfo = {
      watchName: '',
      postedDate: '',
      watchLink: ''
    };

    const titleArr = allContentRowTitle[i].children;
    const lastIndex = Object.keys(titleArr).length - 1;

    let watchName = '';

    // Om det lastIndex === 3 vet vi att css klassen textHighlight finns.
    // Hämta i så fall sista och näst sista.
    if (lastIndex === 3) {
      const watchTitleLastChildText =
        allContentRowTitle[i].children[lastIndex].data;

      // Text från textHighlight
      watchName =
        allContentRowTitle[i].children[lastIndex - 1].children[0].data +
        watchTitleLastChildText;
    } else {
      watchName = $('.contentRow-title')
        .children()
        [i].children[lastIndex].data.trim();
    }

    if (watchName === '') {
      errorLogger.error({ message: 'Watch name not found.' });
      throw new Error();
    }

    // attr "datetime" finns också. Format: 2022-02-24T18:12:49+0100
    const watchDate = $('.u-dt')[i].attribs.title; // Format: 22 Maj 2022 kl 14:16

    const watchLink = `https://klocksnack.se${allContentRowTitle[i].attribs.href}`;

    currentWatchInfo.watchName = watchName;
    currentWatchInfo.postedDate = watchDate;
    currentWatchInfo.watchLink = watchLink;
    scrapedWatchArr.push(currentWatchInfo);
  }

  return scrapedWatchArr;
}

export async function scrapeAllWatches() {
  const allWatches = getAllWatches();

  const activeWatches = allWatches.filter((w) => w.active === true);

  infoLogger.info(
    `Scraping ${activeWatches.length} ${
      activeWatches.length === 1 ? 'watch' : 'watches'
    }`
  );
  for (let i = 0; i < allWatches.length; i += 1) {
    const storedWatch = allWatches[i];

    // Kan den tas bort? activeWatches hämtas ovanför for loopen
    if (storedWatch.active === false) {
      continue;
    }

    // eslint-disable-next-line no-promise-executor-return
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    // eslint-disable-next-line no-await-in-loop
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
        // infoLogger.info({ message: 'Email sent.' });
        // Skriv till databas om när ett mail skickades.
      } catch (err) {
        // await sendErrorNotification(err);
        errorLogger.error({
          message: 'Function sendErrorNotification failed.',
          stacktrace: err
        });
      }
    }
  }
  setTimeout(scrapeAllWatches, interval);
}
