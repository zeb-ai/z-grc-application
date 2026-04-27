import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { v7 as uuidv7 } from "uuid";
import type { Group, User } from "@/database";

@Entity("quota")
export class Quota {
  @PrimaryColumn("varchar", { length: 36 })
  id: string;

  @Column()
  user_id: string;

  @Column()
  group_id: string;

  @Column({ type: "decimal", precision: 10, scale: 6, default: 0 })
  total_cost: number;

  @Column({ type: "decimal", precision: 10, scale: 6, default: 0 })
  used_cost: number;

  user?: User;
  group?: Group;

  @BeforeInsert()
  async generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
