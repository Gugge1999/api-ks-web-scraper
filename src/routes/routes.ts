import express from 'express';
import { DateTime } from 'luxon';

import { interval } from '../config/scraper.config.js';
import { Watch } from '../entity/Watch.js';
import { ScrapedWatches } from '../models/scraped-watches.js';
import * as db from '../services/db.js';
import { scrapeWatchInfo } from '../services/scraper.js';

const router = express.Router();

router.get('/api-status', async (req, res, next) => {
  try {
    const currentTimePlusUptime = DateTime.now().plus({
      seconds: process.uptime()
    });

    const currentTime = DateTime.now();

    const diff = currentTimePlusUptime.diff(currentTime, [
      'years',
      'months',
      'days',
      'hours',
      'minutes',
      'seconds'
    ]);

    return res.status(200).json({
      active: true,
      scrapingIntervalInMinutes: interval / 60000,
      uptime: diff.toObject()
    });
  } catch {
    return next('Could not get API status.');
  }
});

router.post('/add-watch', async (req, res, next) => {
  const scrapedWatchesResult = await scrapeWatchInfo(req.body.linkToThread);

  if ('error' in scrapedWatchesResult) {
    return res.status(400).json('Watch name yielded no results.');
  }

  try {
    const newWatch = await db.addNewWatch(
      req.body.label,
      req.body.linkToThread,
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
    const status = await db.toggleActiveStatus(newStatus, req.body.id);
    return res.status(200).json({ isActive: status, label: req.body.label });
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
