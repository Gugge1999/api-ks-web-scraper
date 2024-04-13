import { createLogger, format, transports } from "winston";

const { combine, timestamp, prettyPrint, errors, printf } = format;

const timeFormat = "HH:mm:ss YYYY-MM-DD";

const customFormat = format.combine(
  timestamp({
    format: timeFormat
  }),
  printf((info) => `${info.message} [${info["timestamp"]}]`)
);

export const errorLogger = createLogger({
  format: combine(
    errors({ stack: true }), // <-- use errors format
    timestamp({
      format: timeFormat
    }),
    prettyPrint()
  ),
  exitOnError: false,
  transports: [new transports.Console(), new transports.File({ filename: "logs/error.log" })]
});

export const infoLogger = createLogger({
  format: format.combine(customFormat),
  transports: [new transports.Console(), new transports.File({ filename: "logs/info.log" })]
});
