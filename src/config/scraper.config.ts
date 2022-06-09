import dotenv from 'dotenv';

dotenv.config();

export const email = {
  user: process.env.EMAIL,
  pass: process.env.PASSWORD,
  emailTo: process.env.EMAILTO
};

const minutes: number = 10;

export const interval = minutes * 60000; // minutes × 60,000 = milliseconds
