'use strict';
const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const db = require('./services/db.service');

const app = express();
app.use(express.json());
app.use(cors()); // Add cors before the routes are defined
app.use(routes);
const port = 3000;

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});

db.scrapeAllWatches();
