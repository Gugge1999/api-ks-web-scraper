const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const app = express();
app.use(express.json());
const port = 3000;

function getDateAndTime() {
  let datetime = new Date().toLocaleString('sv-SE', {
    timeZone: 'Europe/Stockholm',
  });
  return datetime;
}

app.delete('/:id', function (req, res) {
  let watchToRemove = req.params.id;
  let data = fs.readFileSync('data.json');
  let json = JSON.parse(data);
  let watches = json.watches;
  json.watches = watches.filter((watch) => {
    return watch.id !== watchToRemove;
  });
  fs.writeFileSync('data.json', JSON.stringify(json, null, 2));
  res.send(`Watch with id: ${req.params.id} deleted.`);
});

app.post('/add-watch', function (req, res) {
  var obj = {};
  fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      obj = JSON.parse(data); //now it an object

      let newWatch = req.body;
      newWatch['addedOn'] = getDateAndTime();
      newWatch['id'] = uuidv4();
      obj.watches.push(newWatch); //add some data

      json = JSON.stringify(obj, null, 2); //convert it back to json
      fs.writeFile('data.json', json, function (err) {
        if (err) console.log('error', err);
        else {
          let rawdata = fs.readFileSync('data.json');
          let obj = JSON.parse(rawdata);
          //obj.watches[1]; // För att hämta för elementet
          res.send(obj); // Hämta alla klockor
        }
      });
    }
  });
});

app.get('/watches', (req, res) => {
  let rawdata = fs.readFileSync('data.json');
  let obj = JSON.parse(rawdata);
  res.send(obj);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
