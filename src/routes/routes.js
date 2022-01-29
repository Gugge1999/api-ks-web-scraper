const router = require('express').Router();
const fs = require('fs');
const time = require('../services/time-and-date.service');
const { v4: uuidv4 } = require('uuid');
const logger = require('../services/logger.service');

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
        message: `Could not delete watch with id ${watchToRemove} in route: delete/:id. Error message ${err.message}`,
      });
    } else {
      res.status(200).send(`Watch with id: ${req.params.id} deleted.`);
    }
  });
});

router.post('/add-watch', function (req, res) {
  let obj = {};
  fs.readFile(
    'src/data/data.json',
    'utf8',
    function readFileCallback(err, data) {
      if (err) {
        console.log(err);
      } else {
        obj = JSON.parse(data); //now it an object

        let newWatch = req.body;
        newWatch['addedOn'] = time.dateAndTime();
        newWatch['id'] = uuidv4();
        obj.watches.push(newWatch); //add some data
        logger.error({
          message: `Logger test`,
        });

        let json = JSON.stringify(obj, null, 2); //convert it back to json
        fs.writeFile('src/data/data.json', json, function (err) {
          if (err) {
            logger.error({
              message: `Could not write to data.json in route: add-watches. Error message ${err.message}`,
            });
          } else {
            //obj.watches[1]; // För att hämta för elementet
            res.status(201).send(`Added watch with label: ${req.body.label}`);
          }
        });
      }
    }
  );
});

router.get('/watches', (req, res) => {
  let rawdata = fs.readFileSync('src/data/data.json');
  let obj = JSON.parse(rawdata);
  res.status(200).send(obj);
});

router.get('/watch/:id', (req, res) => {
  let storedWatches = JSON.parse(fs.readFileSync('src/data/data.json'));
  let watch = storedWatches.watches.find((watch) => watch.id === req.params.id);
  res.status(200).send(watch);
});

module.exports = router;
