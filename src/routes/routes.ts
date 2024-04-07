import express, { Request } from "express";

import { interval } from "@config/scraper.config";
import { NewWatchFormDTO } from "@models/new-watch-form-dto";
import { addNewWatch, deleteWatchById, getAllWatchesOnlyLatest, toggleActiveStatus } from "@services/database";
import { scrapeWatchInfo } from "@services/scraper";
import getUptime from "@services/uptime";

const router = express.Router();

router.get("/api-status", async (_, res, next) => {
  try {
    return res.status(200).json({
      active: true,
      scrapingIntervalInMinutes: interval / 60000,
      uptime: getUptime()
    });
  } catch {
    return next("Could not get API status.");
  }
});

router.post("/save-watch", async (req: Request<{}, {}, NewWatchFormDTO>, res, next) => {
  try {
    const result = await scrapeWatchInfo(req.body.watchToScrape);

    if ("errorMessage" in result) {
      return res.status(400).json(result);
    } else {
      const newWatch = await addNewWatch(req.body, result);

      return res.status(200).json(newWatch);
    }
  } catch {
    return next("Could not save watch");
  }
});

router.get("/all-watches", async (_, res, next) => {
  try {
    const allWatches = await getAllWatchesOnlyLatest();

    return res.status(200).json(allWatches);
  } catch {
    return next("Could not retrieve all watches.");
  }
});

router.put("/toggle-active-status", async (req, res, next) => {
  try {
    const newStatus = !req.body.isActive;
    const watch = await toggleActiveStatus(newStatus, req.body.id);
    if (watch) {
      return res.status(200).json({ id: watch.id, active: watch.active, label: watch.label });
    }
  } catch {
    return next("Could not toggle status.");
  }
});

router.delete("/delete-watch/:id", async (req, res, next) => {
  try {
    const id = await deleteWatchById(req.params.id);
    if (id) {
      return res.status(200).json({ deletedWatchId: id });
    } else {
      return next(`Could not delete watch with id: ${id}`);
    }
  } catch {
    return next("Could not delete watch.");
  }
});

export default router;
