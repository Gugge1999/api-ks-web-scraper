'use strict';
const express = require('express');
const scraper = require('./services/scraper.service');
const routes = require('./routes/routes');

const app = express();
app.use(express.json());
app.use(routes);
const port = 3000;

scraper.run();

// Byt kanske till en riktig databas. MySql, mongoDB eller RethinkDB
//https://able.bio/rhett/creating-a-web-app-with-a-raspberry-pi-express-and-postgresql--3c90a372#database

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
