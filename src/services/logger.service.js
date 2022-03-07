import { createLogger, format, transports } from 'winston';

const { combine, timestamp, prettyPrint, simple, errors } = format;

export const logger = createLogger({
  format: combine(
    errors({ stack: true }), // <-- use errors format
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'src/logs/ks_web_scraper.log' }),
  ],
});

export const ipLogger = createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    simple()
  ),
  transports: [new transports.File({ filename: 'src/logs/incoming_ip.log' })],
});
