import fs from 'fs';

import { errorLogger, infoLogger } from './logger.service.js';
import { dateAndTime } from './time-and-date.service.js';

export const readLastBackupDateFromFile = async () => {
  try {
    return await fs.promises.readFile('src/logs/last_backup_date.txt', 'utf8');
  } catch (err) {
    return errorLogger.error({
      message: 'function lastBackupDate failed.',
      stacktrace: err
    });
  }
};

export function writeDatabaseBackupDateToFile() {
  fs.promises
    .writeFile('src/logs/last_backup_date123.txt', dateAndTime())
    .then(() => {
      infoLogger.info({
        message: 'Wrote to last_backup_date.txt successfully.'
      });
    })
    .catch((err) => {
      errorLogger.error({
        message: 'Function writeDatabaseBackupDateToFile failed.',
        stacktrace: err
      });
    });
}
