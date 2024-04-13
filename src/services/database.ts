import "reflect-metadata";

import { AppDataSource } from "@config/scraper.config";
import { Watch } from "@config/watch";
import { Email } from "@entity/email";
import { NewWatchFormDTO } from "@models/new-watch-form-dto";
import { ScrapedWatches } from "@models/scraped-watches";
import { errorLogger } from "@services/logger";

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
    errorLogger.error({
      message: "Function getAllWatchesOnlyLatest failed.",
      stacktrace: err
    });

    return null;
  }
}

export async function toggleActiveStatus(isActive: boolean, id: string) {
  try {
    const watchRepository = AppDataSource.getRepository(Watch);

    const watchToUpdate = await watchRepository.findOneBy({ id });

    if (watchToUpdate) {
      watchToUpdate.active = !isActive;
      await watchRepository.save(watchToUpdate);

      return watchToUpdate;
    } else {
      errorLogger.error({
        message: `Could not find watch with id: ${id}`
      });
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
    errorLogger.error({
      message: "Function addNewWatch failed.",
      stacktrace: err
    });

    return null;
  }
}

export async function updateStoredWatches(newWatches: ScrapedWatches[], id: string) {
  try {
    const watchRepository = AppDataSource.getRepository(Watch);

    const watchToUpdate = await watchRepository.findOneBy({ id });

    if (watchToUpdate) {
      watchToUpdate.watches = newWatches;
      watchToUpdate.lastEmailSent = new Date();

      await watchRepository.save(watchToUpdate);

      return watchToUpdate;
    } else {
      return null;
    }
  } catch (err) {
    errorLogger.error({
      message: "Function updateStoredWatch failed.",
      stacktrace: err
    });

    return null;
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

    const watch = await emailRepository.findOneBy({ id: watchId });
  } catch (err) {
    errorLogger.error({
      message: "Function deleteWatch failed.",
      stacktrace: err
    });
  }
}
