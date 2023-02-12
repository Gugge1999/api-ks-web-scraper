import express from 'express';

import { interval } from '../config/scraper.config.js';
import { Watch } from '../entity/Watch.js';
import { NewWatchFormDTO } from '../models/new-watch-form-dto.js';
import { ScrapedWatches } from '../models/scraped-watches.js';
import * as db from '../services/db.js';
import { scrapeWatchInfo } from '../services/scraper.js';
import { getUptime } from '../services/uptime.js';

const router = express.Router();

router.get('/api-status', async (req, res, next) => {
  try {
    return res.status(200).json({
      active: true,
      scrapingIntervalInMinutes: interval / 60000,
      uptime: getUptime()
    });
  } catch {
    return next('Could not get API status.');
  }
});

router.post('/add-watch', async (req, res, next) => {
  const form = req.body as NewWatchFormDTO;

  const scrapedWatchesResult = await scrapeWatchInfo(form.linkToThread);

  if ('errorMessage' in scrapedWatchesResult) {
    return res.status(400).json(scrapedWatchesResult.errorMessage);
  }

  try {
    const newWatch = await db.addNewWatch(
      form.label,
      form.linkToThread,
      scrapedWatchesResult as ScrapedWatches[]
    );
    return res.status(200).json(newWatch);
  } catch {
    return next('Could not save watch');
  }
});

router.get('/all-watches', async (req, res, next) => {
  try {
    const allWatches = (await db.getAllWatchesOnlyLatest()) as Watch[];
    return res.status(200).json(allWatches);
  } catch {
    return next('Could not retrieve all watches.');
  }
});

router.put('/toggle-active-status', async (req, res, next) => {
  try {
    const newStatus = !req.body.isActive;
    const watch = (await db.toggleActiveStatus(
      newStatus,
      req.body.id
    )) as Watch;

    return res
      .status(200)
      .json({ id: watch.id, active: watch.active, label: watch.label });
  } catch {
    return next('Could not toggle status.');
  }
});

router.delete('/delete-watch/:id', async (req, res, next) => {
  try {
    const id = (await db.deleteWatchById(req.params.id)) as string;
    return res.status(200).json({ deletedWatchId: id });
  } catch {
    return next('Could not delete watch.');
  }
});

export default router;
