import dotenv from 'dotenv';

dotenv.config();

export const email = {
  user: process.env.EMAIL,
  pass: process.env.PASSWORD,
  emailTo: process.env.EMAILTO
};

const minutes = 10;

export const interval = minutes * 60000; // minutes × 60,000 = milliseconds

export const prodPuppeteerConfig = {
  headless: true,
  executablePath: '/usr/bin/google-chrome-stable',
  args: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--no-sandbox'
  ]
};
