'use strict';
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;
const time = require('./time-and-date.service');

const logger = createLogger({
  format: combine(
    timestamp({
      format: time.dateAndTime,
    }),
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'src/logs/ks_web_scraper.log' }),
  ],
});

module.exports = logger;
