const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
const port = 3000;

app.get('/', (req, res) => {
  let rawdata = fs.readFileSync('data.json');
  let watches = JSON.parse(rawdata);
  res.send(watches);
});

let newWatch = {
  id: 4,
  link: 'https://www.link4.com',
  name: 'name 5',
  'last scraped': '9-10-2021',
  isActive: true,
};

app.post('/test', function (req, res) {
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
          let rawdata = fs.readFileSync('data.json'); // Show data to user
          let watches = JSON.parse(rawdata);
          res.send(watches);
        }
      });
    }
  });
});

app.get('/write', (req, res) => {
  var obj = {
    table: [],
  };
  var json = JSON.stringify(obj);
  fs.readFile('data.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      obj = JSON.parse(data); //now it an object
      let newWatch = {
        id: 4,
        link: 'https://www.link4.com',
        name: 'name 4',
        'last scraped': '4',
        isActive: true,
      };

      obj.watches.push(newWatch); //add some data
      json = JSON.stringify(obj, null, 2); //convert it back to json
      fs.writeFile('data.json', json, function (err) {
        // log error
        if (err) console.log('error', err);
        else {
          let rawdata = fs.readFileSync('data.json'); // Show data to user
          let watches = JSON.parse(rawdata);
          res.send(watches);
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
