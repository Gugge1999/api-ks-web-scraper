import express, { json } from 'express';
import cors from 'cors';

import routes from './routes/routes.js';
import { scrapeAllWatches } from './services/scraper.service.js';
import * as timeService from './services/time-and-date.service.js';
import { backupDatebase } from './services/db.service.js';

const app = express();
app.use(json());
app.use(cors()); // Lägg till cors FÖRE routes
app.use(routes);
const port = process.env.PORT || 3000;

// Bra länk: https://blog.devgenius.io/deploy-angular-nodejs-application-to-aws-elastic-beanstalk-9ab13076a736

// Kolla också den videon vid timestamp: https://youtu.be/TNV0_7QRDwY?t=22896
// Den förklarar skillnaden mellan app.get och app.use

// Relativ sökväg till Angular dist mappen. Startar från "C:\Code\api\ks_web_scraper_api"
// app.use(
//   '/',
//   express.static('../../angular_projects/ks-web-scraper/dist/ks-web-scraper')
// );

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});

if (timeService.todaysDate() === timeService.lastDayOfTheMonth()) {
  backupDatebase();
}

await scrapeAllWatches();
