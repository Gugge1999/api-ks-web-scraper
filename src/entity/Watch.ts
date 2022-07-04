import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ScrapedWatches } from '../models/scraped-watches.js';

@Entity()
export class Watch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  link: string;

  @Column()
  label: string;

  @Column({ type: 'jsonb' })
  watches: ScrapedWatches[];

  @Column()
  active: boolean;

  @Column({ default: '' })
  last_email_sent: string; // TODO: Ändra till Date

  @Column()
  added: string; // TODO: Ändra till Date
}
