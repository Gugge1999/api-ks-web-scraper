import fs from 'fs';

import { errorLogger, infoLogger } from './logger.service.js';
import { dateAndTime } from './time-and-date.service.js';

export const readLastBackupDateFromFile = async () => {
  try {
    return await fs.promises.readFile('src/logs/last_backup_date.txt', 'utf8');
  } catch (err) {
    errorLogger.error({
      message: 'function lastBackupDate failed.',
      stacktrace: err,
    });
  }
};

export function writeDatabaseBackupDateToFile() {
  fs.promises.writeFile(
    'src/logs/last_backup_date.txt',
    dateAndTime(),
    (err) => {
      if (err) {
        errorLogger.error({
          message: 'Function writeDatabaseBackupDateToFile failed.',
          stacktrace: err,
        });
      } else {
        infoLogger.info({
          message: 'Database backup completed successfully.',
        });
      }
    }
  );
}
