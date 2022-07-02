import cors from 'cors';
import express, { json } from 'express';
import morgan from 'morgan';

import { AppDataSource } from './data-source.js';
import routes from './routes/routes.js';
import { errorLogger, infoLogger, requestLogger } from './services/logger.js';
import errorHandler from './services/middleware.js';
import { compareStoredWithScraped } from './services/scraper.js';

const app = express();

AppDataSource.initialize()
  .then(async () => {
    app.use(
      morgan(
        // För att vilken webbläsare använd: :user-agent
        '::remote-addr :remote-user :method :url - Response time: :response-time ms - :user-agent',
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

    const port = process.env.PORT || 3000;

    infoLogger.info({ message: `process.env.PORT: ${process.env.PORT}` });
    infoLogger.info({
      message: `process.env.NODE_ENV: ${process.env.NODE_ENV}`
    });

    app.listen(port, () => {
      console.log(`Started API.`);
    });

    await compareStoredWithScraped();
  })
  .catch((error: Error) => {
    errorLogger.error({
      message: 'Function AppDataSource.initialize failed.',
      stacktrace: error
    });
  });
