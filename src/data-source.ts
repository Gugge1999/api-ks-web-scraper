import 'reflect-metadata';

import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { Watch } from './entity/Watch.js';

dotenv.config();

export const AppDataSource = new DataSource({
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
});
