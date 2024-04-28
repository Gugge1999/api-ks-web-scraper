import "reflect-metadata";

import { AppDataSource } from "@config/scraper.config";
import { Email } from "@entity/email";
import { Watch } from "@entity/watch";
import { NewWatchFormDTO } from "@models/DTOs/new-watch-form-dto";
import { WatchDto } from "@models/DTOs/watch-dto";
import { ScrapedWatch } from "@models/scraped-watches";
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

    const returnDto: WatchDto[] = [];
    if (allWatchesOnlyLatest.length > 0) {
      allWatchesOnlyLatest.forEach((scrapedWatch) => {
        const dto = createWatchDtoObj(scrapedWatch);
        returnDto.push(dto);
      });
    }

    return returnDto;
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

export async function addNewWatch(form: NewWatchFormDTO, newScrapedWatches: ScrapedWatch[]) {
  try {
    const watch = new Watch();
    watch.label = form.label;
    watch.watches = newScrapedWatches;
    watch.active = true;
    watch.watchToScrape = form.watchToScrape;
    watch.lastEmailSent = null;

    await AppDataSource.getRepository(Watch).save(watch);

    return createWatchDtoObj(watch);
  } catch (err) {
    errorLogger.error({
      message: "Function addNewWatch failed.",
      stacktrace: err
    });

    return null;
  }
}

export async function updateStoredWatches(newWatches: ScrapedWatch[], id: string) {
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

function createWatchDtoObj(watchDbModel: Watch) {
  const dto: WatchDto = {
    id: watchDbModel.id,
    active: watchDbModel.active,
    added: watchDbModel.added,
    label: watchDbModel.label,
    lastEmailSent: watchDbModel.lastEmailSent,
    watchToScrape: watchDbModel.watchToScrape,
    watch: watchDbModel.watches[0]
  };

  return dto;
}
