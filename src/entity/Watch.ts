import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

import { ScrapedWatches } from '../models/scraped-watches.js';

@Entity()
export class Watch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  linkToThread: string;

  @Column()
  label: string;

  @Column({ type: 'jsonb' })
  watches: ScrapedWatches[];

  @Column()
  active: boolean;

  @Column({ type: 'timestamptz', precision: 3 })
  lastEmailSent: Date;

  @CreateDateColumn({ type: 'timestamptz', precision: 3 })
  added: Date;
}
