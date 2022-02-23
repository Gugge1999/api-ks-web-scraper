import { createLogger, format, transports } from 'winston';

const { combine, timestamp, prettyPrint, errors } = format;

const logger = createLogger({
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

export default logger;
