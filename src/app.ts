import { cors } from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { Settings } from "luxon";

import { AppDataSource } from "@config/scraper.config";
import type { ApiErrorDto } from "@models/DTOs/api-error-dto";
import { statusRoutes } from "@routes/status-routes";
import { watchRoutes } from "@routes/watch-routes";
import { errorLogger } from "@services/logger";
import { compareStoredWithScraped } from "@services/scraper";

AppDataSource.initialize()
  .then(async (con) => {
    con.runMigrations();

    // För att se swagger gå in på http://localhost:3000/swagger

    new Elysia()
      .use(cors())
      .use(swagger())
      .onError(({ code, error, set }): ApiErrorDto => {
        switch (code) {
          case "NOT_FOUND":
            return { errorMessage: "Route not found" };
          case "VALIDATION":
            return { errorMessage: "Schema validation error. See console for error", verboseErrorMessage: error };
        }

        set.status = 500;

        return { errorMessage: error.message };
      })
      .use(statusRoutes)
      .use(watchRoutes)
      .listen(process.env.PORT || 3000);

    Settings.defaultZone = "Europe/Stockholm";
    Settings.defaultLocale = "sv";

    await compareStoredWithScraped();
  })
  .catch((error: Error) =>
    errorLogger.error({
      message: "Function AppDataSource.initialize failed",
      stacktrace: error
    })
  );
