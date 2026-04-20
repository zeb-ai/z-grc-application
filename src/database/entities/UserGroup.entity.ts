import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  type ObjectId,
  ObjectIdColumn,
} from "typeorm";
import type { Group } from "./Group.entity";
import type { User } from "./User.entity";

@Entity("user_group")
export class UserGroup {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  id: number;

  @Column()
  user_id: string;

  @Column()
  group_id: number;

  @Column({ type: "enum", enum: ["admin", "member"] })
  role: "admin" | "member";

  @CreateDateColumn()
  joined_at: Date;

  user?: User;
  group?: Group;

  @BeforeInsert()
  async generateId() {
    if (!this.id) {
      this.id = Date.now();
    }
  }
}
