import "reflect-metadata";

import { AppDataSource } from "../data-source.js";
import { Email } from "../entity/email.js";
import { Watch } from "../entity/watch.js";
import { NewWatchFormDTO } from "../models/new-watch-form-dto.js";
import { ScrapedWatches } from "../models/scraped-watches.js";
import { errorLogger } from "./logger.js";

export async function getAllActiveWatches() {
  try {
    const watchRepository = AppDataSource.getRepository(Watch);

    const allActiveWatches = await watchRepository.find({
      where: { active: true }
    });

    return allActiveWatches;
  } catch (err) {
    errorLogger.error({
      message: "Function getAllActiveWatches failed.",
      stacktrace: err
    });

    return null;
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

    if (watchToUpdate) {
      watchToUpdate.active = newStatus;
      await watchRepository.save(watchToUpdate);

      return watchToUpdate;
    } else {
      return null;
    }
  } catch (err) {
    errorLogger.error({
      message: "Function toggleActiveStatus failed.",
      stacktrace: err
    });

    return null;
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

    if (watchToUpdate) {
      watchToUpdate.watches = newWatchesArr;
      watchToUpdate.lastEmailSent = new Date();

      await watchRepository.save(watchToUpdate);
    }
  } catch (err) {
    errorLogger.error({
      message: "Function updateStoredWatch failed.",
      stacktrace: err
    });

    throw Error(err);
  }
}

export async function deleteWatchById(id: string) {
  try {
    const watchRepository = AppDataSource.getRepository(Watch);

    const watchToRemove = await watchRepository.findOneBy({ id });

    if (watchToRemove) {
      await watchRepository.remove(watchToRemove);

      return id;
    } else {
      return null;
    }
  } catch (err) {
    errorLogger.error({
      message: "Function deleteWatch failed.",
      stacktrace: err
    });

    return null;
  }
}

export async function newEmail(watchId: string) {
  try {
    const emailRepository = AppDataSource.getRepository(Email);

    const watchToRemove = await emailRepository.findOneBy({ id: watchId });
    if (watchToRemove) await emailRepository.remove(watchToRemove);
  } catch (err) {
    errorLogger.error({
      message: "Function deleteWatch failed.",
      stacktrace: err
    });
  }
}
