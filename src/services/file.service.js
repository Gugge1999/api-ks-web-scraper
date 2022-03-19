import { format } from 'date-fns';
import fs from 'fs';

import { errorLogger, infoLogger } from './logger.service.js';

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
    format(new Date(), 'dd-MM-yyyy k:mm:ss'),
    (err) => {
      if (err) {
        errorLogger.error({
          message: 'writeFile in app.js failed.',
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
