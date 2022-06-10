import { scrapedWatch } from './scraped-watch.js';

export interface watch {
  id: string;
  link: string;
  label: string;
  watches: scrapedWatch | string;
  active: string | boolean;
  last_email_sent: string;
  added: string;
}
