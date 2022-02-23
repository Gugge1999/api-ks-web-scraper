import express, { json } from 'express';
import cors from 'cors';

import routes from './routes/routes.js';
import { scrapeAllWatches } from './services/scraper.service.js';

const app = express();
app.use(json());
app.use(cors()); // Add cors before the routes are defined
app.use(routes);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});

scrapeAllWatches();
