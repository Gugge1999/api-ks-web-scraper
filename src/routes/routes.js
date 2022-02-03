'use strict';
const router = require('express').Router();
const fs = require('fs');
const logger = require('../services/logger.service');
const database = require('../database/db');

router.delete('/:id', function (req, res) {
  let watchToRemove = req.params.id;
  let data = fs.readFileSync('src/data/data.json');
  let json = JSON.parse(data);
  let watches = json.watches;
  json.watches = watches.filter((watch) => {
    return watch.id !== watchToRemove;
  });
  fs.writeFile('src/data/data.json', JSON.stringify(json, null, 2), (err) => {
    if (err) {
      logger.error({
        message: `Could not delete watch with id ${watchToRemove} in route: delete/:id.`,
        stacktrace: err,
      });
    } else {
      res.status(200).json(`Watch with id: ${req.params.id} deleted.`);
    }
  });
});

router.post('/add-watch', (req, res) => {
  database.addNewWatch(req.body.label, req.body.uri);

  res.status(201).json(`Added watch with label: ${req.body.label}`);
});

router.get('/all-watches', (req, res) => {
  let allWatches = database.getAllWatches();
  res.status(200).json(allWatches);
});

router.get('/watch/:id', (req, res) => {
  let storedWatches = JSON.parse(fs.readFileSync('src/data/data.json'));
  let watch = storedWatches.watches.find((watch) => watch.id === req.params.id);
  res.status(200).json(watch);
});

module.exports = router;
