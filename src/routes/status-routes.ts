import { interval } from "@config/scraper.config";
import type { Elysia } from "elysia";

import getUptime from "@services/uptime";

const STATUS_BASE_URL = "/api";

export const statusRoutes = (app: Elysia) =>
  app.get(`${STATUS_BASE_URL}/api-status`, () => {
    try {
      return {
        active: true,
        scrapingIntervalInMinutes: interval / 60000,
        uptime: getUptime()
      };
    } catch {
      throw new Error("Could not get API status");
    }
  });
