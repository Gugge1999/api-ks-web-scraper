import cors from "cors";
import express, { json } from "express";
import { Settings } from "luxon";

import { AppDataSource } from "@config/scraper.config";
import routes from "@routes/routes";
import { errorLogger } from "@services/logger";
import { errorHandler } from "@services/middleware";
import { compareStoredWithScraped } from "@services/scraper";

const app = express();

AppDataSource.initialize()
  .then(async (con) => {
    con.runMigrations();
    app.use(json());
    app.use(cors()); // Lägg till cors FÖRE routes
    app.use(routes);
    app.use(errorHandler);

    const port = process.env["PORT"] || 3000;

    Settings.defaultZone = "Europe/Stockholm";
    Settings.defaultLocale = "sv";

    app.listen(port);

    // await compareStoredWithScraped();
  })
  .catch((error: Error) =>
    errorLogger.error({
      message: "Function AppDataSource.initialize failed.",
      stacktrace: error
    })
  );
