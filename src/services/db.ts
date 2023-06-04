import "reflect-metadata";

import { AppDataSource } from "../data-source.js";
import { Email } from "../entity/email.js";
import { Watch } from "../entity/watch.js";
import { NewWatchFormDTO } from "../models/new-watch-form-dto.js";
import { ScrapedWatches } from "../models/scraped-watches.js";
import { errorLogger } from "./logger.js";

export async function getAllWatches() {
  try {
    const allWatches = await AppDataSource.manager.find(Watch);

    return allWatches;
  } catch (err) {
    return errorLogger.error({
      message: "Function getAllWatches failed.",
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
      message: "Function getAllActiveWatches failed.",
      stacktrace: err
    });
  }
}

export async function getAllWatchesOnlyLatest() {
  try {
    const watchRepository = AppDataSource.getRepository(Watch);

    const allWatchesOnlyLatest = (await watchRepository.find({ order: { added: "ASC" } })).map((element) => {
      element.watches.splice(1, element.watches.length);
      return element;
    });

    return allWatchesOnlyLatest;
  } catch (err) {
    return errorLogger.error({
      message: "Function getAllWatchesOnlyLatest failed.",
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

    return watchToUpdate;
  } catch (err) {
    return errorLogger.error({
      message: "Function toggleActiveStatus failed.",
      stacktrace: err
    });
  }
}

export async function addNewWatch(form: NewWatchFormDTO, newScrapedWatches: ScrapedWatches[]) {
  try {
    const watch = new Watch();
    watch.label = form.label;
    watch.watches = newScrapedWatches;
    watch.active = true;
    watch.watchToScrape = form.watchToScrape;
    watch.lastEmailSent = null;

    await AppDataSource.getRepository(Watch).save(watch);

    return watch;
  } catch (err) {
    return errorLogger.error({
      message: "Function addNewWatch failed.",
      stacktrace: err
    });
  }
}

export async function updateStoredWatches(newWatchesArr: ScrapedWatches[], id: string) {
  try {
    const watchRepository = AppDataSource.getRepository(Watch);

    const watchToUpdate = await watchRepository.findOneBy({ id });

    watchToUpdate.watches = newWatchesArr;
    watchToUpdate.lastEmailSent = new Date();

    await watchRepository.save(watchToUpdate);
  } catch (err) {
    errorLogger.error({
      message: "Function updateStoredWatch failed.",
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
      message: "Function deleteWatch failed.",
      stacktrace: err
    });
  }
}

export async function newEmail(watchId: string) {
  try {
    const emailRepository = AppDataSource.getRepository(Email);

    const watchToRemove = await emailRepository.findOneBy({ id: watchId });
    await emailRepository.remove(watchToRemove);
  } catch (err) {
    return errorLogger.error({
      message: "Function deleteWatch failed.",
      stacktrace: err
    });
  }
}
