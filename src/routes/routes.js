'use strict';
const router = require('express').Router();
const database = require('../database/db');

router.get('/is-api-active', (req, res) => {
  res.status(200).json('API is active');
});

router.post('/add-watch', async (req, res) => {
  await database.addNewWatch(req.body.label, req.body.uri);
  res.status(201).json(`Added watch with label: ${req.body.label}`);
});

router.get('/all-watches', async (req, res) => {
  let allWatches = await database.getAllWatches();
  res.status(200).json(allWatches);
});

router.put('/update-active-status', async (req, res) => {
  await database.updateActiveStatus(req.body.isActive, req.body.id);
  res.status(200).json(`Updated active status on: ${req.body.label}`);
});

router.delete('/delete-watch/:id', async (req, res) => {
  await database.deleteWatch(req.params.id);
  res.status(200).json(`Deleted watch with id: ${req.params.id}`);
});

module.exports = router;
