import { load } from "cheerio";

import { interval } from "@config/scraper.config";
import { ApiErrorDto } from "@models/DTOs/api-error-dto";
import { ScrapedWatch } from "@models/scraped-watches";
import { getAllActiveWatches, updateStoredWatches } from "@services/database";
import { errorLogger, infoLogger } from "@services/logger";
import { sendErrorNotification, sendWatchNotification } from "@services/notification";
import { dateAndTime, time } from "@services/time-and-date";

export async function scrapeWatchInfo(watchToScrape: string): Promise<ScrapedWatch[] | ApiErrorDto> {
  let response: Response;

  try {
    response = await fetch(watchToScrape);
  } catch (err) {
    const message = `Could not fetch url ${watchToScrape}`;
    console.error(message, err);
    return { errorMessage: message };
  }

  const body = await response.text();

  const $ = load(body);

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
    .map((element) => {
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
    .map((element) => dates.push($(element).attr("datetime")!));

  // Länk
  $(".contentRow-title")
    .get()
    .map((element) => links.push("https://klocksnack.se" + $(element).find("a").attr("href")));

  const scrapedWatches: ScrapedWatch[] = [];

  titles.forEach((_, index) => {
    const currentWatchInfo: ScrapedWatch = {
      name: titles[index],
      postedDate: dates[index],
      link: links[index]
    };
    scrapedWatches.push(currentWatchInfo);
  });

  return scrapedWatches;
}

export async function compareStoredWithScraped() {
  const storedActiveWatches = await getAllActiveWatches();

  if (storedActiveWatches === null) {
    return;
  }

  if (storedActiveWatches.length === 0) {
    console.log(`No active watches @ ${dateAndTime()}`);
  } else {
    const length = storedActiveWatches.length;
    console.log(`Scraping ${length} ${length === 1 ? "watch" : "watches"} @ ${dateAndTime()}`);
  }

  storedActiveWatches.forEach(async (watch) => {
    const storedWatchRow = watch;

    const storedWatches = storedWatchRow.watches;

    const scrapedWatches = await scrapeWatchInfo(storedWatchRow.watchToScrape);

    if ("errorMessage" in scrapedWatches) return;

    // Vänta 1 sekund mellan varje anrop till KS
    Bun.sleepSync(1000);

    // TODO: Just nu jämförs de lagrade klockorna och de scrape:ade endast på postedDate. Är det unikt nog ?
    const newScrapedWatches = scrapedWatches.filter(({ postedDate: a }: { postedDate: string }) => {
      return !storedWatches.some(({ postedDate: b }: { postedDate: string }) => b === a);
    });

    if (newScrapedWatches.length > 0) {
      handleNewScrapedWatch(scrapedWatches, newScrapedWatches, storedWatchRow.id);
    }
  });

  setTimeout(compareStoredWithScraped, interval);
}

async function handleNewScrapedWatch(scrapedWatches: ScrapedWatch[], newScrapedWatches: ScrapedWatch[], storedWatchRowId: string) {
  // TODO: Ska det vara scrapedWatches eller newScrapedWatches?
  updateStoredWatches(scrapedWatches, storedWatchRowId);

  // Loopa över varje ny klocka och skicka mail
  newScrapedWatches.forEach(async (element) => {
    // TODO: Ska inte try catch täcka hela compareStoredWithScraped?
    try {
      await sendWatchNotification(getEmailText(element));

      infoLogger.info({ message: "Email sent." });
      // Skriv till databas (skapa tabell) om när ett mail skickades.

      // Vänta 5 sekunder mellan varje mail.
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (err) {
      await sendErrorNotification(err);
      errorLogger.error({
        message: "Function sendWatchNotification failed.",
        stacktrace: err
      });
    }
  });
}

function getEmailText(newScrapedWatch: ScrapedWatch) {
  return `${newScrapedWatch.name}\n\nLänk: ${newScrapedWatch.link}\n\nDetta mail skickades: ${time()}`;
}
