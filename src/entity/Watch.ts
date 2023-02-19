import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ScrapedWatches } from '../models/scraped-watches.js';

@Entity()
export class Watch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  watchToScrape: string;

  @Column()
  label: string;

  @Column({ type: 'jsonb' })
  watches: ScrapedWatches[];

  @Column()
  active: boolean;

  @Column({ type: 'timestamptz', precision: 3, nullable: true })
  lastEmailSent: Date;

  @Column({ type: 'timestamptz', precision: 3 })
  added: Date = new Date();
}
