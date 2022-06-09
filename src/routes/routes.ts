import { intervalToDuration } from 'date-fns';
import express from 'express';

import { interval } from '../config/scraper.config.js';
import * as db from '../services/db.service.js';
import { readLastBackupDateFromFile } from '../services/file.service.js';

// import { scrapeWatchInfo } from '../services/scraper.service.js';

const router = express.Router();

router.get('/api-status', async (req, res, next) => {
  try {
    res.status(200).json({
      active: true,
      lastDatabaseBackupDate: await readLastBackupDateFromFile(),
      scrapingIntervalInMinutes: interval / 60000,
      uptime: intervalToDuration({ start: 0, end: process.uptime() * 1000 })
    });
  } catch {
    next('Could not get API status.');
  }
});

router.post('/add-watch', async (req, res, next) => {
  // const scrapedWatches = await scrapeWatchInfo(req.body.link);
  const scrapedWatches: any = '';

  if (scrapedWatches === 'Watch name yielded no results') {
    res.status(400).json('Watch name yielded no results.');
    return;
  }

  try {
    const newWatch = db.addNewWatch(
      req.body.label,
      req.body.link,
      scrapedWatches
    );
    res.status(200).json(newWatch);
  } catch {
    next('Could not save watch');
  }
});

router.get('/all-watches', (req, res, next) => {
  try {
    const allWatches = db.getAllWatchesOnlyLatest();
    res.status(200).json(allWatches);
  } catch {
    next('Could not retrieve all watches.');
  }
});

router.put('/toggle-active-status', (req, res, next) => {
  try {
    const newStatus = !req.body.isActive;
    const status = db.toggleActiveStatus(newStatus.toString(), req.body.id);
    res.status(200).json({ isActive: status, label: req.body.label });
  } catch {
    next('Could not toggle status.');
  }
});

router.delete('/delete-watch/:id', (req, res, next) => {
  try {
    const id = db.deleteWatch(req.params.id);
    res.status(200).json({ deletedWatchId: id });
  } catch {
    next('Could not delete watch.');
  }
});

export default router;
