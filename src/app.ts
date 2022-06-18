import cors from 'cors';
import express, { json } from 'express';
import morgan from 'morgan';
import schedule from 'node-schedule';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/routes.js';
import { backupDatabase } from './services/db.js';
import { writeDatabaseBackupDateToFile } from './services/file.js';
import { errorLogger, requestLogger } from './services/logger.js';
import errorHandler from './services/middleware.js';

import { compareStoredWithScraped } from './services/scraper.js';

const app = express();
app.use(
  morgan(
    // För att vilken webbläsare använd: :user-agent
    '::remote-addr :remote-user :method :url - Response time: :response-time ms',
    {
      stream: {
        write: (message) =>
          // Tar bort ny rad efter att stream.write.
          // Se: https://stackoverflow.com/questions/27906551/node-js-logging-use-morgan-and-winston/28824464#28824464
          requestLogger.info(message.trim())
      }
    }
  )
);
app.use(json());
app.use(cors()); // Lägg till cors FÖRE routes
app.use(routes);
app.use(errorHandler);

const port = process.env.PORT || process.env.NODE_ENV || 3010;

const relativePath = (a: any) =>
  join(dirname(fileURLToPath(import.meta.url)), a);

/*
  När den finns en dist mapp från Angular om man sen bygger express skapas
  det flera mappar 
  Temporär fix: 
    1: kör npm run build i api och döp om den till node-dist
    2: Kopiera över angular dist-mappen
*/

console.log('process.env.PORT: ' + process.env.PORT);
console.log('process.env.NODE_EN: ' + process.env.NODE_ENV);

const pathToAngularDist = relativePath('../ng-dist/ks-web-scraper');

app.use('/', express.static(pathToAngularDist));

app.listen(port);

// Backup av databasen varje dag klockan 12:00
schedule.scheduleJob({ hour: 12, minute: 0 }, () => {
  try {
    backupDatabase();
    writeDatabaseBackupDateToFile();
    console.log('test');
  } catch (err) {
    errorLogger.error({
      message: 'Function backupDatabase failed.',
      stacktrace: err
    });
  }
});

await compareStoredWithScraped();
