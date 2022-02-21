'use strict';
import express, { json } from 'express';
import cors from 'cors';
import routes from './routes/routes.js';
import { scrapeAllWatches } from './services/db.service.js';

const app = express();
app.use(json()); // Behövs det? Är det default?
app.use(cors()); // Add cors before the routes are defined
app.use(routes);
const port = 3000; // Vad är default port?

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});

scrapeAllWatches();
