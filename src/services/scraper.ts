import cheerio from "cheerio";
import puppeteer, { ElementHandle } from "puppeteer";

import { interval, prodPuppeteerConfig } from "../config/scraper.config.js";
import { Watch } from "../entity/watch.js";
import { ScrapedWatches } from "../models/scraped-watches.js";
import { getAllActiveWatches, updateStoredWatches } from "./db.js";
import { errorLogger, infoLogger } from "./logger.js";
import { sendErrorNotification, sendWatchNotification } from "./notification.js";
import * as timeService from "./time-and-date.js";

export async function scrapeWatchInfo(searchTerm: string) {
  const body = await getContentFromSearchTerm(searchTerm);

  if (body === "") {
    return { errorMessage: "API - Could not get link to thread" };
  }

  const $ = cheerio.load(body);

  // Länken gav inga resultat.
  if ($(".contentRow-title").length === 0) {
    return { errorMessage: "Watch name yielded no results" };
  }

  const titlesArr: string[] = [];
  const datesArr: string[] = [];
  const linksArr: string[] = [];

  // Titel
  $(".contentRow-title")
    .get()
    .map((element: cheerio.Element) => {
      return titlesArr.push(
        $(element)
          .text()
          .replace(
            // Radera säljstatus
            /Tillbakadragen|Avslutad|Säljes\/Bytes|Säljes|Bytes|OHPF|\//i,
            ""
          )
          .trim()
      );
    });

  // Datum
  $(".u-dt")
    .get()
    .map((element: cheerio.Element) => datesArr.push($(element).attr("datetime")!));

  // Länk
  $(".contentRow-title")
    .get()
    .map((element: cheerio.Element) => linksArr.push("https://klocksnack.se" + $(element).find("a").attr("href")));

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

  console.log(`Scraping ${allWatches.length} ${allWatches.length === 1 ? "watch" : "watches"} @ ${timeService.time()}`);

  for (let i = 0; i < allWatches.length; i += 1) {
    const storedWatchRow = allWatches[i];

    const storedWatchesArr = storedWatchRow.watches;

    const scrapedWatchesArr = (await scrapeWatchInfo(storedWatchRow.watchToScrape)) as ScrapedWatches[];

    // Vänta 1 sekund mellan varje anrop till KS
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    // Just nu jämförs de lagrade klockorna och de scrape:ade endast på postedDate.
    // TODO: Är det unikt nog ?
    const newScrapedWatches = scrapedWatchesArr.filter(({ postedDate: a }: { postedDate: string }) => {
      return storedWatchesArr.some(({ postedDate: b }: { postedDate: string }) => b === a);
    });

    if (newScrapedWatches.length > 0) {
      // TODO David: Ska det vara scrapedWatchesArr eller newScrapedWatches?
      updateStoredWatches(scrapedWatchesArr, storedWatchRow.id);

      // Loopa över varje ny klocka och skicka mail
      for (let j = 0; j < newScrapedWatches.length; j += 1) {
        const emailText = getEmailText(newScrapedWatches[j]);

        try {
          // await sendWatchNotification(emailText);

          infoLogger.info({ message: "Email sent." });
          // Skriv till databas (skapa tabell) om när ett mail skickades.

          // Vänta 5 sekunder mellan varje mail.
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (err) {
          // await sendErrorNotification(err);
          errorLogger.error({
            message: "Function sendWatchNotification failed.",
            stacktrace: err
          });
        }
      }
    }
  }
  setTimeout(compareStoredWithScraped, interval);
}

async function getContentFromSearchTerm(searchTerm: string) {
  try {
    const browser =
      process.env.NODE_ENV === "develop" ? await puppeteer.launch() : await puppeteer.launch(prodPuppeteerConfig);

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(60_000);

    await page.goto("https://klocksnack.se/search/?type=post");

    // Acceptera cookies, klick 2 gånger verkar funka bäst
    await page.waitForSelector('[mode="primary"]');
    page.click('[mode="primary"]');
    page.click('[mode="primary"]');

    await page.waitForSelector('input[type="search"]');
    await page.click('input[type="search"]');
    await page.type('input[type="search"]', searchTerm);

    const sokBaraTitlarElement = await page.$x("//span[contains(., 'Sök bara titlar')]");
    await (sokBaraTitlarElement[1] as ElementHandle<Element>).click();

    // 11 = Handla - Säljes, bytes
    await page.select('select[name="c[nodes][]"]', "11");

    await Promise.all([page.waitForNavigation(), page.click(".formSubmitRow-controls .button--primary")]);

    const pageContent = await page.content();

    await browser.close();

    return pageContent;
  } catch (err) {
    errorLogger.error({
      message: "Function getUrlForSearchResult failed.",
      stacktrace: err
    });

    return "";
  }
}

function getEmailText(newScrapedWatches: ScrapedWatches) {
  return `${newScrapedWatches.name}\n\nLänk: ${
    newScrapedWatches.link
  }\n\nDetta mail skickades: ${timeService.dateAndTime()}`;
}
