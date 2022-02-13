'use strict';
const router = require('express').Router();
const database = require('../database/db');

router.post('/add-watch', (req, res) => {
  database.addNewWatch(req.body.label, req.body.uri);
  res.status(201).json(`Added watch with label: ${req.body.label}`);
});

router.get('/all-watches', (req, res) => {
  let allWatches = database.getAllWatches();
  res.status(200).json(allWatches);
});

router.put('/update-is-active', (req, res) => {
  database.updateIsActive(req.body.isActive, req.body.id);
  res.status(200).json(`Updated active status on: ${req.body.label}`);
});

router.delete('/delete-watch/:id', (req, res) => {
  database.deleteWatch(req.params.id);
  res.status(200).json('Deleted watch: ');
});

module.exports = router;
