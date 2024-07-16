import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import type { ScrapedWatch } from "@models/scraped-watches";

@Entity()
export class Watch {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  watchToScrape!: string;

  @Column({ type: "varchar" })
  label!: string;

  @Column({ type: "jsonb" })
  watches!: ScrapedWatch[];

  @Column({ type: "boolean" })
  active!: boolean;

  @Column({ type: "timestamptz", precision: 3, nullable: true })
  lastEmailSent!: Date | null;

  @Column({ type: "timestamptz", precision: 3 })
  added: Date = new Date();
}
