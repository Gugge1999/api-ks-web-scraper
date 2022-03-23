import { intervalToDuration } from 'date-fns';
import express from 'express';

import * as db from '../services/db.service.js';
import { readLastBackupDateFromFile } from '../services/file.service.js';
import { interval } from '../config/scraper.config.js';

const router = express.Router();

router.get('/api-status', async (req, res) => {
  res.status(200).json({
    active: true,
    lastDatabaseBackupDate: await readLastBackupDateFromFile(),
    scrapingIntervalInMinutes: interval / 60000,
    uptime: intervalToDuration({ start: 0, end: process.uptime() * 1000 }),
  });
});

router.post('/add-watch', async (req, res) => {
  const newWatch = await db.addNewWatch(req.body.label, req.body.link);
  res.status(201).json(newWatch);
});

router.get('/all-watches', (req, res) => {
  const allWatches = db.getAllWatches();
  res.status(200).json(allWatches);
});

router.put('/update-active-status', (req, res) => {
  db.updateActiveStatus(req.body.isActive, req.body.id);
  res.status(200).json(`Updated active status on: ${req.body.label}`);
});

router.delete('/delete-watch/:id', (req, res) => {
  db.deleteWatch(req.params.id);
  res.status(200).json({ id: req.params.id });
});

export default router;
