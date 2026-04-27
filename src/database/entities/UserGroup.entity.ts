import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { v7 as uuidv7 } from "uuid";
import type { Group } from "./Group.entity";
import type { User } from "./User.entity";

@Entity("user_group")
export class UserGroup {
  @PrimaryColumn("varchar", { length: 36 })
  id: string;

  @Column()
  user_id: string;

  @Column()
  group_id: string;

  @Column({ type: "varchar", length: 20 })
  role: "admin" | "member";

  @CreateDateColumn()
  joined_at: Date;

  user?: User;
  group?: Group;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
