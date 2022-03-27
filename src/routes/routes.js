import { intervalToDuration } from 'date-fns';
import express from 'express';

import * as db from '../services/db.service.js';
import { readLastBackupDateFromFile } from '../services/file.service.js';
import { interval } from '../config/scraper.config.js';
import { scrapeWatchInfo } from '../services/scraper.service.js';

const router = express.Router();

router.get('/api-status', async (req, res) => {
  try {
    res.status(200).json({
      active: true,
      lastDatabaseBackupDate: await readLastBackupDateFromFile(),
      scrapingIntervalInMinutes: interval / 60000,
      uptime: intervalToDuration({ start: 0, end: process.uptime() * 1000 })
    });
  } catch {
    res.status(500).json({ message: 'Could not get API status.' });
  }
});

router.post('/add-watch', async (req, res) => {
  let watchInfo;
  try {
    watchInfo = await scrapeWatchInfo(req.body.link);
    try {
      const newWatch = db.addNewWatch(req.body.label, req.body.link, watchInfo);
      res.status(200).json(newWatch);
    } catch {
      res.status(500).json({ message: 'Could not save watch.' });
    }
  } catch {
    res.status(400).json({ message: 'Invalid link.' });
  }
});

router.get('/all-watches', (req, res) => {
  try {
    const allWatches = db.getAllWatches();
    res.status(200).json(allWatches);
  } catch {
    res.status(500).json({ message: 'Could not get all watches.' });
  }
});

router.put('/update-active-status', (req, res) => {
  try {
    db.updateActiveStatus(req.body.isActive, req.body.id);
    res.status(200).json(`Updated active status on: ${req.body.label}`);
  } catch {
    res.status(500).json({ message: 'Could not update status.' });
  }
});

router.delete('/delete-watch/:id', (req, res) => {
  try {
    db.deleteWatch(req.params.id);
    res.status(200).json({ id: req.params.id });
  } catch {
    res.status(500).json({ message: 'Could not delete watch.' });
  }
});

export default router;
