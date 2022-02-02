'use strict';
const express = require('express');
const scraper = require('./services/scraper.service');
const routes = require('./routes/routes');

const app = express();
app.use(express.json());
app.use(routes);
const port = 3000;

scraper.run();

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});