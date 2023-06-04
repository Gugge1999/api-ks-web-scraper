import "reflect-metadata";

import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";

import { Watch } from "./entity/watch.js";

dotenv.config();

const devConfig: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT ?? "5432"),
  username: process.env.PGUSERNAME,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  synchronize: false,
  logging: false,
  entities: [Watch],
  migrations: ["src/migrations/*.ts"],
  subscribers: []
};

const prodConfig: PostgresConnectionOptions = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [Watch],
  migrations: ["src/migrations/*.js"],
  subscribers: [],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
  }
};

export const AppDataSource = new DataSource(process.env.NODE_ENV === "develop" ? devConfig : prodConfig);
