import { intervalToDuration } from 'date-fns';
import express from 'express';

import { interval } from '../config/scraper.config.js';
import * as db from '../services/db.js';
import { readLastBackupDateFromFile } from '../services/file.js';
import { scrapeWatchInfo } from '../services/scraper.js';

const router = express.Router();

router.get('/api-status', async (req, res, next) => {
  try {
    return res.status(200).json({
      active: true,
      lastDatabaseBackupDate: await readLastBackupDateFromFile(),
      scrapingIntervalInMinutes: interval / 60000,
      uptime: intervalToDuration({ start: 0, end: process.uptime() * 1000 })
    });
  } catch {
    return next('Could not get API status.');
  }
});

router.post('/add-watch', async (req, res, next) => {
  const scrapedWatches = await scrapeWatchInfo(req.body.link);

  if (scrapedWatches[0].name === 'Watch name yielded no results') {
    return res.status(400).json('Watch name yielded no results.');
  }

  try {
    const newWatch = await db.addNewWatch(
      req.body.label,
      req.body.link,
      scrapedWatches
    );
    return res.status(200).json(newWatch);
  } catch {
    return next('Could not save watch');
  }
});

router.get('/all-watches', async (req, res, next) => {
  try {
    const allWatches = await db.getAllWatchesOnlyLatest();
    return res.status(200).json(allWatches);
  } catch {
    return next('Could not retrieve all watches.');
  }
});

router.put('/toggle-active-status', async (req, res, next) => {
  try {
    const newStatus = !req.body.isActive;
    const status = await db.toggleActiveStatus(newStatus, req.body.id);
    return res.status(200).json({ isActive: status, label: req.body.label });
  } catch {
    return next('Could not toggle status.');
  }
});

router.delete('/delete-watch/:id', async (req, res, next) => {
  try {
    const id = await db.deleteWatch(req.params.id);
    return res.status(200).json({ deletedWatchId: id });
  } catch {
    return next('Could not delete watch.');
  }
});

export default router;
