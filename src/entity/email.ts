import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Watch } from "./watch.js";

@Entity()
export class Email {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamptz", precision: 3 })
  added: Date = new Date();

  @OneToOne(() => Watch, { onDelete: "CASCADE" })
  @JoinColumn()
  watch: Watch;
}
