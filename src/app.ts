import { cors } from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { Settings } from "luxon";

import { AppDataSource, interval } from "@config/scraper.config";
import { addNewWatch, deleteWatchById, getAllWatchesOnlyLatest, toggleActiveStatus } from "@services/database";
import { errorLogger } from "@services/logger";
import { compareStoredWithScraped, scrapeWatchInfo } from "@services/scraper";
import getUptime from "@services/uptime";

AppDataSource.initialize()
  .then(async (con) => {
    con.runMigrations();

    // För att se swagger gå in på http://localhost:3000/swagger

    new Elysia()
      .use(cors())
      .use(swagger())
      .onError(({ code, error, set }) => {
        if (code === "NOT_FOUND") return "Route not found";

        set.status = 500;
        errorLogger.error({
          message: error.message,
          stacktrace: error
        });

        return error.message;
      })
      .get("/api-status", () => {
        try {
          return {
            active: true,
            scrapingIntervalInMinutes: interval / 60000,
            uptime: getUptime()
          };
        } catch {
          throw new Error("Could not get API status");
        }
      })
      .get("/all-watches", async () => {
        try {
          const allWatches = await getAllWatchesOnlyLatest();

          return allWatches;
        } catch {
          throw new Error("Could not retrieve all watches");
        }
      })
      .post(
        "/save-watch",
        async ({ body }) => {
          const result = await scrapeWatchInfo(body.watchToScrape);
          if ("errorMessage" in result) {
            return result;
          } else {
            const newWatch = await addNewWatch(body, result);

            if (newWatch === null) {
              throw new Error("Could not save watch");
            }

            return JSON.stringify(newWatch);
          }
        },
        {
          body: t.Object({
            label: t.String(),
            watchToScrape: t.String()
          })
        }
      )
      .put(
        "/toggle-active-status",
        async ({ body }) => {
          const watch = await toggleActiveStatus(body.isActive, body.id);

          if (watch === null) {
            throw new Error("Could not toggle status");
          }

          return { id: watch.id, active: watch.active, label: watch.label };
        },
        {
          body: t.Object({
            id: t.String(),
            label: t.String(),
            isActive: t.Boolean()
          })
        }
      )
      .delete(
        "/delete-watch/:id",
        async ({ params }) => {
          const id = params.id;

          const result = await deleteWatchById(id);

          if (result === null) {
            throw new Error(`Could not delete watch with id: ${id}`);
          }

          return { deleteWatchId: id };
        },
        {
          params: t.Object({
            id: t.String()
          })
        }
      )
      .listen(process.env["PORT"] || 3000);

    Settings.defaultZone = "Europe/Stockholm";
    Settings.defaultLocale = "sv";

    await compareStoredWithScraped();
  })
  .catch((error: Error) =>
    errorLogger.error({
      message: "Function AppDataSource.initialize failed",
      stacktrace: error
    })
  );
