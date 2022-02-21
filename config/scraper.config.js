'use strict';
import dotenv from 'dotenv';
dotenv.config();

export const email = {
  user: process.env.EMAIL,
  pass: process.env.PASSWORD,
  emailTo: process.env.EMAILTO,
};

export const interval = 10 * 60000; // milliseconds = minutes × 60,000
