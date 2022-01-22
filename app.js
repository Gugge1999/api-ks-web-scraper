'use strict';
const express = require('express');
const ScraperService = require('./services/ScraperService');
const routes = require('./routes/routes');

const app = express();
app.use(express.json());
app.use(routes);
const port = 3000;

ScraperService.run();

// Byt kanske till en riktig databas. MySql, mongoDB eller RethinkDB

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
