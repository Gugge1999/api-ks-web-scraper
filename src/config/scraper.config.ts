import dotenv from "dotenv";

dotenv.config();

export const emailConfig = {
  user: process.env.EMAIL,
  pass: process.env.PASSWORD,
  emailTo: process.env.EMAILTO
};

const minutes = 10;
const milliseconds = 60_000;

export const interval = minutes * milliseconds; // 10 minuter
