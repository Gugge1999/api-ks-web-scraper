import type { Watch } from "@entity/watch";
import type { ScrapedWatch } from "@models/scraped-watches";

export type WatchDto = Omit<Watch, "watches"> & {
  watch: ScrapedWatch;
};
