const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;

// Se hur winston-logging hanteras här: https://github.com/galenmaly/lighterpack/blob/master/server/log.js

const logger = createLogger({
  format: combine(timestamp(), prettyPrint()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: '../logs/ks_web_scraper.log' }),
  ],
});

module.exports = logger;
