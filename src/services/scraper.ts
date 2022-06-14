import cheerio from 'cheerio';
import fetch from 'node-fetch';

import { interval } from '../config/scraper.config.js';
import { scrapedWatch } from '../models/scraped-watch.js';
import { getAllActiveWatches, updateStoredWatches } from './db.js';
import { errorLogger, infoLogger } from './logger.js';
import {
  sendErrorNotification,
  sendKernelNotification
} from './notification.js';
import * as timeService from './time-and-date.js';

// Byt från any
export async function scrapeWatchInfo(link: string): Promise<any> {
  const response = await fetch(link);
  const body = await response.text();

  const $ = cheerio.load(body);

  // Länken gav inga resultat.
  if ($('.contentRow-title').length === 0) {
    return 'Watch name yielded no results';
  }

  const scrapedWatchArr: scrapedWatch[] = [];

  const allTitles: string[] = [];
  const allPostedDates: string[] = [];
  const allLinks: string[] = [];

  // Titel
  $('.contentRow-title').each(function (this: cheerio.Element) {
    allTitles.push(
      $(this)
        .text()
        .replace(
          // Radera säljstatus
          /Tillbakadragen|Avslutad|Säljes\/Bytes|Säljes|Bytes|OHPF|\//i,
          ''
        )
        .trim()
    );
  });

  // Datum
  $('.u-dt')
    .get()
    .map((x) => {
      allPostedDates.push($(x).attr('datetime') ?? '0000-00-00T00:00:00+0000'); //Format: 2022-05-14T09:06:18+0200
    });

  // Länk
  $('.contentRow-title')
    .map((i, card) => {
      allLinks.push(`https://klocksnack.se${$(card).find('a').attr('href')}`);
    })
    .get();

  // Lägg titel, datum och länk i ett objekt och pusha till array:en
  for (let i = 0; i < allTitles.length; i++) {
    const currentWatchInfo: scrapedWatch = {
      name: allTitles[i],
      postedDate: allPostedDates[i],
      link: allLinks[i]
    };
    scrapedWatchArr.push(currentWatchInfo);
  }

  return scrapedWatchArr;
}

export async function compareStoredWithScraped() {
  const allWatches = getAllActiveWatches();

  console.log(
    `Scraping ${allWatches.length} ${
      allWatches.length === 1 ? 'watch' : 'watches'
    } @ ${timeService.dateAndTime()}`
  );
  for (let i = 0; i < allWatches.length; i += 1) {
    const storedWatchRow = allWatches[i];

    const storedWatchesArr = JSON.parse(storedWatchRow.watches.toString());

    const scrapedWatchArr = await scrapeWatchInfo(storedWatchRow.link);

    // Vänta 1 sekund mellan varje anrop till KS
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    // Just nu jämförs de lagrade klockorna och de scrape:ade endast på postedDate.
    // Är det unikt nog ?
    const newScrapedWatches = scrapedWatchArr.filter(
      ({ postedDate: id1 }: { postedDate: string }) =>
        !storedWatchesArr.some(
          ({ postedDate: id2 }: { postedDate: string }) => id2 === id1
        )
    );

    if (newScrapedWatches.length > 0) {
      updateStoredWatches(JSON.stringify(scrapedWatchArr), storedWatchRow.id);

      // Loopa över varje ny klocka och skicka mail
      for (let j = 0; j < newScrapedWatches.length; j += 1) {
        const emailText = `${newScrapedWatches[j].name}\n\nLänk: ${
          newScrapedWatches[j].link
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