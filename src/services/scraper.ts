import cheerio from "cheerio";

import { interval } from "../config/scraper.config.js";
import { ScrapedWatches } from "../models/scraped-watches.js";
import { getAllActiveWatches, updateStoredWatches } from "./database.js";
import { errorLogger, infoLogger } from "./logger.js";
import { sendErrorNotification, sendWatchNotification } from "./notification.js";
import { dateAndTime, time } from "./time-and-date.js";

export async function scrapeWatchInfo(watchToScrape: string) {
  const scrapedWatchArr: ScrapedWatches[] = [];

  const response = await fetch(watchToScrape);

  const body = await response.text();

  const $ = cheerio.load(body);

  // Länken gav inga resultat.
  if ($(".contentRow-title").length === 0) {
    return { errorMessage: "Watch name yielded no results" };
  }

  const titles: string[] = [];
  const dates: string[] = [];
  const links: string[] = [];

  // Titel
  $(".contentRow-title")
    .get()
    .map((element: cheerio.Element) => {
      return titles.push(
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
    .map((element: cheerio.Element) => dates.push($(element).attr("datetime")!));

  // Länk
  $(".contentRow-title")
    .get()
    .map((element: cheerio.Element) => links.push("https://klocksnack.se" + $(element).find("a").attr("href")));

  const scrapedWatch: ScrapedWatches[] = [];

  // Lägg titel, datum och länk i ett objekt och pusha till array:en
  titles.forEach((_, index) => {
    const currentWatchInfo: ScrapedWatches = {
      name: titles[index],
      postedDate: dates[index],
      link: links[index]
    };
    scrapedWatch.push(currentWatchInfo);
  });

  return scrapedWatch;
}

export async function compareStoredWithScraped() {
  const activeWatches = await getAllActiveWatches();

  if (activeWatches === null) return;

  console.log(
    `Scraping ${activeWatches.length} ${activeWatches.length === 1 ? "watch" : "watches"} @ ${dateAndTime()}`
  );

  for (let i = 0; i < activeWatches.length; i += 1) {
    const storedWatchRow = activeWatches[i];

    const storedWatches = storedWatchRow.watches;

    const scrapedWatches = await scrapeWatchInfo(storedWatchRow.watchToScrape);

    if ("errorMessage" in scrapedWatches) return;

    // Vänta 1 sekund mellan varje anrop till KS
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Just nu jämförs de lagrade klockorna och de scrape:ade endast på postedDate.
    // TODO: Är det unikt nog ?
    const newScrapedWatches = scrapedWatches.filter(({ postedDate: a }: { postedDate: string }) => {
      return storedWatches.some(({ postedDate: b }: { postedDate: string }) => b === a);
    });

    // TODO: Bryta ut i funktion?
    if (newScrapedWatches.length > 0) {
      // TODO David: Ska det vara scrapedWatches eller newScrapedWatches?
      updateStoredWatches(scrapedWatches, storedWatchRow.id);

      // Loopa över varje ny klocka och skicka mail
      for (let j = 0; j < newScrapedWatches.length; j += 1) {
        try {
          // await sendWatchNotification(getEmailText(newScrapedWatches[j]));

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

export function getEmailText(newScrapedWatches: ScrapedWatches) {
  return `${newScrapedWatches.name}\n\nLänk: ${newScrapedWatches.link}\n\nDetta mail skickades: ${time()}`;
}
