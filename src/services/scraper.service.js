import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

import { interval } from '../config/scraper.config.js';
import {
  sendKernelNotification,
  sendErrorNotification
} from './notification.service.js';
import * as timeService from './time-and-date.service.js';
import {
  getAllActiveWatches,
  updateStoredWatches,
  getAllWatchesOnlyLatest
} from './db.service.js';
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

    // Format: 2022-05-14T09:06:18+0200
    const watchDate = $('.u-dt')[i].attribs.datetime;

    const watchLink = `https://klocksnack.se${allContentRowTitle[i].attribs.href}`;

    currentWatchInfo.watchName = watchName;
    currentWatchInfo.postedDate = watchDate;
    currentWatchInfo.watchLink = watchLink;
    scrapedWatchArr.push(currentWatchInfo);
  }

  getAllWatchesOnlyLatest();

  return scrapedWatchArr;
}

export async function compareStoredWithScraped() {
  const allWatches = getAllActiveWatches();

  infoLogger.info(
    `Scraping ${allWatches.length} ${
      allWatches.length === 1 ? 'watch' : 'watches'
    }`
  );
  for (let i = 0; i < allWatches.length; i += 1) {
    const storedWatchRow = allWatches[i];

    const storedWatchesArr = JSON.parse(storedWatchRow.watches);

    // Vänta 1 sekund mellan varje anrop till KS
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    const scrapedWatchArr = await scrapeWatchInfo(storedWatchRow.link);

    // Just nu jämförs de lagrade klockorna och de scrape:ade endast på postedDate.
    // Är det unikt nog ?
    const newScrapedWatches = scrapedWatchArr.filter(
      ({ postedDate: id1 }) =>
        !storedWatchesArr.some(({ postedDate: id2 }) => id2 === id1)
    );

    if (newScrapedWatches.length > 0) {
      updateStoredWatches(JSON.stringify(scrapedWatchArr), storedWatchRow.id);

      // Loopa över varje ny klocka och skicka mail
      for (let j = 0; j < newScrapedWatches.length; j += 1) {
        const emailText = `${newScrapedWatches[j].watchName}\n\nLänk: ${
          newScrapedWatches[j].watchLink
        }\n\nDetta mail skickades: ${timeService.dateAndTime()}`;

        try {
          // await sendKernelNotification(emailText);

          infoLogger.info({ message: 'Email sent.' });
          // Skriv till databas (skapa tabell) om när ett mail skickades.

          // Vänta 5 sekunder mellan varje mail.
          await new Promise((resolve) => {
            setTimeout(resolve, 5000);
          });
        } catch (err) {
          // await sendErrorNotification(err);
          errorLogger.error({
            message: 'Function sendKernelNotification failed.',
            stacktrace: err
          });
        }
      }
    }
  }
  setTimeout(compareStoredWithScraped, interval);
}
