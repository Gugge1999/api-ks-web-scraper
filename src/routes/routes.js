import { intervalToDuration } from 'date-fns';
import express from 'express';

import * as db from '../services/db.service.js';
import { readLastBackupDateFromFile } from '../services/file.service.js';
import { interval } from '../config/scraper.config.js';

const router = express.Router();

router.get('/api-status', async (req, res) => {
  try {
    res.status(200).json({
      active: true,
      lastDatabaseBackupDate: await readLastBackupDateFromFile(),
      scrapingIntervalInMinutes: interval / 60000,
      uptime: intervalToDuration({ start: 0, end: process.uptime() * 1000 })
    });
  } catch (error) {
    res.status(500).json('Route: api-status failed');
  }
});

router.post('/add-watch', async (req, res) => {
  try {
    const newWatch = await db.addNewWatch(req.body.label, req.body.link);
    res.status(201).json(newWatch);
  } catch (err) {
    res.status(500).json('Route: add-watch failed');
  }
});

router.get('/all-watches', (req, res) => {
  try {
    const allWatches = db.getAllWatches();
    res.status(200).json(allWatches);
  } catch (err) {
    res.status(500).json('Route: all-watches failed');
  }
});

router.put('/update-active-status', (req, res) => {
  try {
    db.updateActiveStatus(req.body.isActive, req.body.id);
    res.status(200).json(`Updated active status on: ${req.body.label}`);
  } catch (err) {
    res.status(500).json('Route: update-active-status failed');
  }
});

router.delete('/delete-watch/:id', (req, res) => {
  try {
    db.deleteWatch(req.params.id);
    res.status(200).json({ id: req.params.id });
  } catch (err) {
    res.status(500).json('Route: delete-watch/:id failed');
  }
});

export default router;
