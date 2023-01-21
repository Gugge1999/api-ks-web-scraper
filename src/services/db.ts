import 'reflect-metadata';

import { AppDataSource } from '../data-source.js';
import { Watch } from '../entity/Watch.js';
import { ScrapedWatches } from '../models/scraped-watches.js';
import { errorLogger } from './logger.js';

export async function getAllWatches() {
  try {
    const allWatches = await AppDataSource.manager.find(Watch);

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
    const watchRepository = AppDataSource.getRepository(Watch);

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
    const watchRepository = AppDataSource.getRepository(Watch);

    let allWatches = await watchRepository.find({ order: { added: 'ASC' } });

    allWatches = allWatches.map((element, index) => {
      allWatches[index].watches.splice(1, allWatches[index].watches.length);
      return element;
    });

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
    const watchRepository = AppDataSource.getRepository(Watch);

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
  newScrapedWatches: ScrapedWatches[]
) {
  try {
    const watchRepository = AppDataSource.getRepository(Watch);

    const watch = new Watch();
    watch.link = link;
    watch.label = label;
    watch.watches = newScrapedWatches;
    watch.active = true;
    watch.last_email_sent = new Date();

    let newWatch = await watchRepository
      .createQueryBuilder()
      .insert()
      .into(Watch)
      .values(watch)
      .returning('*')
      .execute();

    watch.id = newWatch.generatedMaps[0].id;
    watch.watches = [newWatch.generatedMaps[0].watches[0]];

    return watch;
  } catch (err) {
    return errorLogger.error({
      message: 'Function addNewWatch failed.',
      stacktrace: err
    });
  }
}

export async function updateStoredWatches(
  newWatchArr: ScrapedWatches[],
  id: string
) {
  try {
    const watchRepository = AppDataSource.getRepository(Watch);

    const watchToUpdate = await watchRepository.findOneBy({ id });
    watchToUpdate.watches = newWatchArr;
    watchToUpdate.last_email_sent = new Date();
    await watchRepository.save(watchToUpdate);
  } catch (err) {
    errorLogger.error({
      message: 'Function updateStoredWatch failed.',
      stacktrace: err
    });
  }
}

export async function deleteWatchById(id: string) {
  try {
    const watchRepository = AppDataSource.getRepository(Watch);

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
