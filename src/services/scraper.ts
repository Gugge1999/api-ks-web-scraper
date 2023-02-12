import cheerio from 'cheerio';
import puppeteer, { ElementHandle } from 'puppeteer';

import { interval } from '../config/scraper.config.js';
import { Watch } from '../entity/Watch.js';
import { ScrapedWatches } from '../models/scraped-watches.js';
import { getAllActiveWatches, updateStoredWatches } from './db.js';
import { errorLogger, infoLogger } from './logger.js';
import {
  sendErrorNotification,
  sendKernelNotification
} from './notification.js';
import * as timeService from './time-and-date.js';

export async function scrapeWatchInfo(searchTerm: string) {
  const url = await getUrlForSearchResult('rolex');

  if (url === '') {
    return { errorMessage: 'API - Could not get link to thread' };
  }

  const response = await fetch(url);
  const body = await response.text();

  const $ = cheerio.load(body);

  // Länken gav inga resultat.
  if ($('.contentRow-title').length === 0) {
    return { errorMessage: 'Watch name yielded no results' };
  }

  const titlesArr: string[] = [];
  const datesArr: string[] = [];
  const linksArr: string[] = [];

  // Titel
  $('.contentRow-title')
    .get()
    .map((element: cheerio.Element) =>
      titlesArr.push(
        $(element)
          .text()
          .replace(
            // Radera säljstatus
            /Tillbakadragen|Avslutad|Säljes\/Bytes|Säljes|Bytes|OHPF|\//i,
            ''
          )
          .trim()
      )
    );

  // Datum
  $('.u-dt')
    .get()
    .map((element: cheerio.Element) =>
      datesArr.push($(element).attr('datetime'))
    );

  // Länk
  $('.contentRow-title')
    .get()
    .map((element: cheerio.Element) =>
      linksArr.push('https://klocksnack.se' + $(element).find('a').attr('href'))
    );

  const scrapedWatchArr: ScrapedWatches[] = [];

  // Lägg titel, datum och länk i ett objekt och pusha till array:en
  titlesArr.forEach((element, index) => {
    const currentWatchInfo: ScrapedWatches = {
      name: titlesArr[index],
      postedDate: datesArr[index],
      link: linksArr[index]
    };
    scrapedWatchArr.push(currentWatchInfo);
  });

  return scrapedWatchArr;
}

export async function compareStoredWithScraped() {
  const allWatches = (await getAllActiveWatches()) as Watch[];

  console.log(
    `Scraping ${allWatches.length} ${
      allWatches.length === 1 ? 'watch' : 'watches'
    } @ ${timeService.time()}`
  );

  for (let i = 0; i < allWatches.length; i += 1) {
    const storedWatchRow = allWatches[i];

    const storedWatchesArr = storedWatchRow.watches;

    const scrapedWatchArr = (await scrapeWatchInfo(
      storedWatchRow.linkToThread
    )) as ScrapedWatches[];

    // Vänta 1 sekund mellan varje anrop till KS
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    // Just nu jämförs de lagrade klockorna och de scrape:ade endast på postedDate.
    // TODO: Är det unikt nog ?
    const newScrapedWatches = scrapedWatchArr.filter(
      ({ postedDate: id1 }: { postedDate: string }) =>
        !storedWatchesArr.some(
          ({ postedDate: id2 }: { postedDate: string }) => id2 === id1
        )
    );

    if (newScrapedWatches.length > 0) {
      updateStoredWatches(scrapedWatchArr, storedWatchRow.id);

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

export async function getUrlForSearchResult(searchTerm: string) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(20_000);

    await page.goto('https://klocksnack.se/search/?type=post');

    // TODO: Behövs den när man gör headless?
    await page.setViewport({ width: 1080, height: 1024 });

    // Acceptera cookies, klick 2 gånger verkar funka bäst
    await page.waitForSelector('[mode="primary"]');
    page.click('[mode="primary"]');
    page.click('[mode="primary"]');

    await page.waitForSelector('input[type="search"]');
    await page.click('input[type="search"]');
    await page.type('input[type="search"]', searchTerm);

    const sokBaraTitlarElement = await page.$x(
      "//span[contains(., 'Sök bara titlar')]"
    );
    await (sokBaraTitlarElement[1] as ElementHandle<Element>).click();

    // 11 = Handla - Säljes, bytes
    await page.select('select[name="c[nodes][]"]', '11');

    await Promise.all([
      page.waitForNavigation(),
      page.click('.formSubmitRow-controls .button--primary')
    ]);

    const url = page.url();

    await browser.close();

    return url;
  } catch (err) {
    errorLogger.error({
      message: 'Function getUrlForSearchResult failed.',
      stacktrace: err
    });

    return '';
  }
}
