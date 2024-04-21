import { Elysia, t } from "elysia";

import { ApiError } from "@models/api.error";
import { WatchDto } from "@models/watch-dto";
import { addNewWatch, deleteWatchById, getAllWatchesOnlyLatest, toggleActiveStatus } from "@services/database";
import { scrapeWatchInfo } from "@services/scraper";

export const watchRoutes = (app: Elysia) =>
  app
    .get("/all-watches", async (): Promise<WatchDto[] | ApiError | null> => {
      const allWatches = await getAllWatchesOnlyLatest();

      if (allWatches === null) {
        throw new Error("Could not retrieve all watches");
      }

      return allWatches;
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
        const result = await deleteWatchById(params.id);

        if (result === null) {
          throw new Error(`Could not delete watch with id: ${params.id}`);
        }

        return { deleteWatchId: params.id };
      },
      {
        params: t.Object({
          id: t.String()
        })
      }
    );
