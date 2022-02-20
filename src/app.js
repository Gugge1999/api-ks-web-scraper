'use strict';
const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const db = require('./database/db');

const app = express();
app.use(express.json());
app.use(cors()); // Add cors before the routes are defined
app.use(routes);
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

db.scrapeAllWatches();
