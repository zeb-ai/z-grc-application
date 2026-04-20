import {
  BeforeInsert,
  Column,
  Entity,
  type ObjectId,
  ObjectIdColumn,
} from "typeorm";
import type { Group } from "@/database";
import type { User } from "@/database";

@Entity("quota")
export class Quota {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  id: number;

  @Column()
  user_id: string;

  @Column()
  group_id: number;

  @Column()
  tokens_remaining: number;

  @Column({ default: 0 })
  tokens_used: number;

  user?: User;
  group?: Group;

  @BeforeInsert()
  async generateId() {
    if (!this.id) {
      this.id = Date.now();
    }
  }
}
