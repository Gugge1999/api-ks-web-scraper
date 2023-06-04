import cors from "cors";
import express, { json } from "express";
import { Settings } from "luxon";
import morgan from "morgan";

import { AppDataSource } from "./data-source.js";
import routes from "./routes/routes.js";
import { errorLogger, requestLogger } from "./services/logger.js";
import errorHandler from "./services/middleware.js";
import { compareStoredWithScraped } from "./services/scraper.js";

const app = express();

AppDataSource.initialize()
  .then(async (con) => {
    con.runMigrations();
    app.use(
      morgan(
        // För att vilken webbläsare använd: :user-agent
        "::remote-addr :remote-user :method :url - Response time: :response-time ms - :user-agent",
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

    Settings.defaultZone = "Europe/Stockholm";
    Settings.defaultLocale = "sv";

    app.listen(port);

    await compareStoredWithScraped();
  })
  .catch((error: Error) => {
    errorLogger.error({
      message: "Function AppDataSource.initialize failed.",
      stacktrace: error
    });
  });
