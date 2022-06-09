import cheerio from 'cheerio';
import fetch from 'node-fetch';

import { interval } from '../config/scraper.config.js';
import { scrapedWatch } from '../models/scraped-watch.js';
import {
  getAllActiveWatches,
  updateStoredWatches
} from '../services/db.service.js';
import { errorLogger, infoLogger } from '../services/logger.service.js';
import {
  sendErrorNotification,
  sendKernelNotification
} from '../services/notification.service.js';
import * as timeService from '../services/time-and-date.service.js';

export async function scrapeWatchInfo(link: string): Promise<any> {
  const response = await fetch(link);
  const body = await response.text();

  const $ = cheerio.load(body);

  // Länken gav inga resultat.
  if ($('.contentRow-title').length === 0) {
    return 'Watch name yielded no results';
  }

  const scrapedWatchArr: scrapedWatch[] = [];

  const allContentRowTitle: any[] = [];

  // SPARA
  // $('.contentRow-title').each(function (this: cheerio.Element, i, elem) {
  //   allContentRowTitle.push(i, elem, $(this).text().trim());
  // });

  $('.contentRow-title').each(function (this: cheerio.Element) {
    allContentRowTitle.push(
      $(this)
        .text()
        .replace(/Tillbakadragen|Avslutad|Säljes|OHPF|Bytes|\//gi, '') // Remove sale status of the watch
        .trim()
    );
  });

  for (let i = 0; i < allContentRowTitle.length; i += 1) {
    const currentWatchInfo: scrapedWatch = {
      name: '',
      date: '',
      link: ''
    };

    let watchName = '';

    const lastIndex = allContentRowTitle.length - 1;

    const titleAttributes = [];

    for (let j = 0; j < allContentRowTitle.length; j += 1) {
      for (let x = 0; x < allContentRowTitle[i][0].children.length; x++) {
        titleAttributes.push(
          allContentRowTitle[i][0].children[x].attribs ?? { class: 'Text' }
        );
      }
    }

    // Kolla först om textHighlight finns
    if (titleAttributes.find((e) => e.class === 'textHighlight')) {
      const firstTextAtIndex = titleAttributes.findIndex(
        (e) => e.class === 'Text'
      );

      // Om de är stämmer vet vi att Text är den sista i Children
      if (firstTextAtIndex === titleAttributes.length - 1) {
        const watchTitleLastChildText =
          allContentRowTitle[i].children[lastIndex].data;

        // Text från textHighlight
        watchName =
          allContentRowTitle[i].children[lastIndex - 1].children[0].data +
          watchTitleLastChildText;
      } else {
        // Text är inte sist. Loopa över alla Children. Börja vid första Text
        // och sluta vid sista i Children. Vid varje varv måste class kollas
        // för att se om det är Text eller textHighlight.
        for (let k = firstTextAtIndex; k < titleAttributes.length; k += 1) {
          if (titleAttributes[k].class === 'Text') {
            watchName = watchName.concat(
              allContentRowTitle[i].children[k].data
            );
          } else {
            watchName = watchName.concat(
              allContentRowTitle[i].children[k].children[0].data
            );
          }
        }
      }
    } else {
      // textHighlight finns inte. Vi kan bara gå på index för att hämta titel.
      // watchName = $('.contentRow-title').children()[i].children[lastIndex].data;
    }

    if (watchName === '') {
      errorLogger.error({ message: 'Watch name not found.' });
      throw new Error();
    }

    // Format: 2022-05-14T09:06:18+0200
    // const watchDate = $('.u-dt')[i].attribs.datetime;

    const watchLink = `https://klocksnack.se${allContentRowTitle[i].attribs.href}`;

    currentWatchInfo.name = watchName;
    // currentWatchInfo.date = watchDate;
    currentWatchInfo.link = watchLink;
    scrapedWatchArr.push(currentWatchInfo);
  }
  return scrapedWatchArr;
}

/*
export async function compareStoredWithScraped() {
  const allWatches = getAllActiveWatches();

  console.log(
    `Scraping ${allWatches.length} ${
      allWatches.length === 1 ? 'watch' : 'watches'
    } @ ${timeService.dateAndTime()}`
  );
  for (let i = 0; i < allWatches.length; i += 1) {
    const storedWatchRow = allWatches[i];

    const storedWatchesArr = JSON.parse(storedWatchRow.watches);

    const scrapedWatchArr = await scrapeWatchInfo(storedWatchRow.link);

    // Vänta 1 sekund mellan varje anrop till KS
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

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
*/
