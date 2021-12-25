const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const app = express();
app.use(express.json());
const port = 3000;

app.delete('/:link', function (req, res) {
  const id = crypto.randomBytes(3 * 4).toString('base64'); // För att skapa en GUID
  console.log(id); // hLjmgBrIjGqiPTsf

  let removeWatch = req.params.link;
  let data = fs.readFileSync('data.json');
  let json = JSON.parse(data);
  let watches = json.watches;
  json.watches = watches.filter((watch) => {
    return watch.link !== removeWatch;
  });
  fs.writeFileSync('data.json', JSON.stringify(json, null, 2));
  res.send(`Watch with link: ${req.params.link} deleted.`);
});

app.post('/add-watch', function (req, res) {
  var obj = {
    table: [],
  };
  var json = JSON.stringify(obj);
  fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      obj = JSON.parse(data); //now it an object
      obj.watches.push(req.body); //add some data
      json = JSON.stringify(obj, null, 2); //convert it back to json
      fs.writeFile('data.json', json, function (err) {
        // log error
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
  let rawdata = fs.readFileSync('data.json'); // Show data to user
  let obj = JSON.parse(rawdata);
  res.send(obj);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
