import { interval } from "../config/scraper.config.js";
import { getAllActiveWatches, updateStoredWatches } from "./database.js";
import { errorLogger, infoLogger } from "./logger.js";
import { getEmailText, scrapeWatchInfo } from "./scraper.js";
import { dateAndTime } from "./time-and-date.js";

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
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

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
