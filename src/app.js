import cors from 'cors';
import { format } from 'date-fns';
import express, { json } from 'express';
import fs from 'fs';
import schedule from 'node-schedule';

import routes from './routes/routes.js';
import { scrapeAllWatches } from './services/scraper.service.js';
import { backupDatebase } from './services/db.service.js';
import { errorLogger, infoLogger } from './services/logger.service.js';

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

// Gör en backup av databsen varje söndag klockan 12:00
schedule.scheduleJob({ hour: 12, minute: 0, dayOfWeek: 0 }, function () {
  try {
    backupDatebase();
    fs.promises.writeFile(
      'src/logs/last_backup_date.txt',
      format(new Date(), 'dd-MM-yyyy k:mm:ss'),
      (err) => {
        if (err) {
          errorLogger.error({
            message: 'writeFile in app.js failed.',
            stacktrace: err,
          });
        } else {
          infoLogger.info({
            message: 'Database backup completed successfully.',
          });
        }
      }
    );
  } catch (err) {
    errorLogger.error({
      message: 'Function backupDatebase failed.',
      stacktrace: err,
    });
  }
});

await scrapeAllWatches();
