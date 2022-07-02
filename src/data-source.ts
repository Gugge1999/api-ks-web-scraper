import 'reflect-metadata';

import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { Watch } from './entity/Watch.js';

dotenv.config();

const devConfig = {
  type: 'postgres',
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  username: process.env.PGUSERNAME,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  synchronize: true,
  logging: false,
  entities: [Watch],
  migrations: [],
  subscribers: []
};

const prodConfig = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [Watch],
  migrations: [],
  subscribers: [],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
  }
};

export const AppDataSource = new DataSource(
  process.env.NODE_ENV === 'develop' ? devConfig : prodConfig
);
