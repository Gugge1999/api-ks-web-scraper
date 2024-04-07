import dotenv from "dotenv";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

import { Watch } from "@entity/watch";

dotenv.config();

export const emailConfig = {
  user: process.env.EMAIL,
  pass: process.env.PASSWORD,
  emailTo: process.env.EMAILTO
};

const minutes = 10;
const milliseconds = 60_000;

export const interval = minutes * milliseconds; // 10 minuter

dotenv.config();

const devConfig: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT!),
  username: process.env.PGUSERNAME,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  synchronize: false,
  logging: false, // Byt till true om konstiga fel kastas från postgres
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
