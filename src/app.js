import cors from 'cors';
import express, { json } from 'express';
import morgan from 'morgan';
import schedule from 'node-schedule';

import routes from './routes/routes.js';
import { scrapeAllWatches } from './services/scraper.service.js';
import { backupDatebase } from './services/db.service.js';
import { errorLogger, requestLogger } from './services/logger.service.js';
import { writeDatabaseBackupDateToFile } from './services/file.service.js';

const app = express();
app.use(
  morgan(
    // För att vilken webbläsare använd: :user-agent
    '::remote-addr :remote-user :method :url - Response time: :response-time ms',
    {
      stream: {
        write: (message) =>
          // Tar bort ny read efter att stream.write.
          // Se: https://stackoverflow.com/questions/27906551/node-js-logging-use-morgan-and-winston/28824464#28824464
          requestLogger.info(message.trim())
      }
    }
  )
);
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

app.listen(port);

// Backup av databsen varje söndag klockan 12:00
schedule.scheduleJob({ hour: 12, minute: 0, dayOfWeek: 0 }, () => {
  try {
    backupDatebase();
    writeDatabaseBackupDateToFile();
  } catch (err) {
    errorLogger.error({
      message: 'Function backupDatebase failed.',
      stacktrace: err
    });
  }
});

await scrapeAllWatches();
