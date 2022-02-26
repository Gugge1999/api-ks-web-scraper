import express, { json } from 'express';
import cors from 'cors';

import routes from './routes/routes.js';
import { scrapeAllWatches } from './services/scraper.service.js';

const app = express();
app.use(json());
app.use(cors()); // Lägg till cors FÖRE routes
app.use(routes);
const port = process.env.PORT || 3000;

// Relativ sökväg till Angular dist mappen. Startar från "C:\Code\api\ks_web_scraper_api"
// app.use(
//   '/',
//   express.static('../../angular_projects/ks-web-scraper/dist/ks-web-scraper')
// );

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});

await scrapeAllWatches();
