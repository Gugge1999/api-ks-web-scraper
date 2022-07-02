import 'reflect-metadata';

import { Repository } from 'typeorm/index.js';

import { AppDataSource } from '../data-source.js';
import { Watch } from '../entity/Watch.js';
import { scrapedWatch } from '../models/scraped-watch.js';
import { errorLogger } from './logger.js';
import { dateAndTime } from './time-and-date.js';

export async function getAllWatches() {
  try {
    const allWatches: Repository<Watch> = await AppDataSource.manager.find(
      Watch
    );
    return allWatches;
  } catch (err) {
    return errorLogger.error({
      message: 'Function getAllWatches failed.',
      stacktrace: err
    });
  }
}

export async function getAllActiveWatches() {
  try {
    const watchRepository: Repository<Watch> =
      AppDataSource.manager.getRepository(Watch);

    const allActiveWatches = await watchRepository.find({
      where: { active: true }
    });

    return allActiveWatches;
  } catch (err) {
    return errorLogger.error({
      message: 'Function getAllActiveWatches failed.',
      stacktrace: err
    });
  }
}

export async function getAllWatchesOnlyLatest() {
  try {
    // Det går inte att använda : Repository<Watch> eftersom den inte har .length som property...
    // Hitta annan lösning
    const allWatches = await AppDataSource.manager.find(Watch);

    for (let i = 0; i < allWatches.length; i += 1) {
      const firstWatchInArr = allWatches[i].watches[0];
      allWatches[i].watches = firstWatchInArr;
    }

    return allWatches;
  } catch (err) {
    return errorLogger.error({
      message: 'Function getAllWatchesOnlyLatest failed.',
      stacktrace: err
    });
  }
}

export async function toggleActiveStatus(newStatus: boolean, id: string) {
  try {
    const watchRepository: Repository<Watch> =
      AppDataSource.getRepository(Watch);

    const watchToUpdate = await watchRepository.findOneBy({ id });
    watchToUpdate.active = newStatus;
    await watchRepository.save(watchToUpdate);

    return newStatus;
  } catch (err) {
    return errorLogger.error({
      message: 'Function toggleActiveStatus failed.',
      stacktrace: err
    });
  }
}

export async function addNewWatch(
  label: string,
  link: string,
  newScrapedWatches: scrapedWatch[]
) {
  try {
    const watchRepository: Repository<Watch> =
      AppDataSource.manager.getRepository(Watch);

    const watch = new Watch();
    watch.link = link;
    watch.label = label;
    watch.watches = newScrapedWatches;
    watch.active = true;
    watch.last_email_sent = '';
    watch.added = dateAndTime();

    let newWatch = await watchRepository
      .createQueryBuilder()
      .insert()
      .into(Watch)
      .values(watch)
      .returning('*')
      .execute();

    watch.id = newWatch.generatedMaps[0].id;
    watch.watches = newWatch.generatedMaps[0].watches[0];

    return watch;
  } catch (err) {
    return errorLogger.error({
      message: 'Function addNewWatch failed.',
      stacktrace: err
    });
  }
}

export async function updateStoredWatches(
  newWatchArr: scrapedWatch[],
  id: string
) {
  try {
    const watchRepository: Repository<Watch> =
      AppDataSource.getRepository(Watch);

    const watchToUpdate = await watchRepository.findOneBy({ id });
    watchToUpdate.watches = newWatchArr;
    watchToUpdate.last_email_sent = dateAndTime();
    await watchRepository.save(watchToUpdate);
  } catch (err) {
    errorLogger.error({
      message: 'Function updateStoredWatch failed.',
      stacktrace: err
    });
  }
}

export async function deleteWatch(id: string) {
  try {
    const watchRepository: Repository<Watch> =
      AppDataSource.getRepository(Watch);

    const watchToRemove = await watchRepository.findOneBy({ id });
    await watchRepository.remove(watchToRemove);

    return id;
  } catch (err) {
    return errorLogger.error({
      message: 'Function deleteWatch failed.',
      stacktrace: err
    });
  }
}
