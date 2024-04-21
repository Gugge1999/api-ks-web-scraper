import { Watch } from "@entity/watch";
import { ScrapedWatch } from "./scraped-watches";

export type WatchDto = Omit<Watch, "watches"> & {
  watch: ScrapedWatch;
};
