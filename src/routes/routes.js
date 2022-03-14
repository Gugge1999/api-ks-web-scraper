import express from 'express';

import * as db from '../services/db.service.js';
import { infoLogger } from '../services/logger.service.js';

const router = express.Router();

router.get('/is-api-active', (req, res) => {
  res.status(200).json('API is active');
});

router.post('/add-watch', async (req, res) => {
  const newWatch = await db.addNewWatch(req.body.label, req.body.uri);
  res.status(201).json(newWatch);
});

router.get('/all-watches', (req, res) => {
  infoLogger.info(req.ip ?? 'No IP address could be identified');
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
