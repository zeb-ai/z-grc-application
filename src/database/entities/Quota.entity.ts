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

  @Column({ type: "decimal", precision: 10, scale: 6, default: 0 })
  total_cost: number;

  @Column({ type: "decimal", precision: 10, scale: 6, default: 0 })
  used_cost: number;

  user?: User;
  group?: Group;

  @BeforeInsert()
  async generateId() {
    if (!this.id) {
      this.id = Date.now();
    }
  }
}
