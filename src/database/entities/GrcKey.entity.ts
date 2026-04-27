import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { v7 as uuidv7 } from "uuid";

@Entity("grc_keys")
export class GrcKey {
  @PrimaryColumn("varchar", { length: 36 })
  id!: string; // UUID v7

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  user_id!: string; // Creator's user_id

  @Column()
  group_id!: string; // Associated user group

  @Column()
  governance_url!: string; // host in encoded payload

  @Column({ nullable: true })
  otel_endpoint?: string; // otel in encoded payload

  @CreateDateColumn()
  created_at!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
