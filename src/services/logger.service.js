import { createLogger, format, transports } from 'winston';

const { combine, timestamp, prettyPrint, simple, errors } = format;

export const errorLogger = createLogger({
  format: combine(
    errors({ stack: true }), // <-- use errors format
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    prettyPrint()
  ),
  exitOnError: false,
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'src/logs/error.log' }),
  ],
});

// Lägga till https://www.npmjs.com/package/winston-daily-rotate-file ?
export const requestLogger = createLogger({
  format: simple(),
  transports: [new transports.File({ filename: 'src/logs/requests.log' })],
});

export const infoLogger = createLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    simple()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'src/logs/info.log' }),
  ],
});
