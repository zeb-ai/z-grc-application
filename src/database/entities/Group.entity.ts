import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { v7 as uuidv7 } from "uuid";
import { Quota } from "./Quota.entity";
import type { User } from "./User.entity";
import { UserGroup } from "./UserGroup.entity";

@Entity("group")
export class Group {
  @PrimaryColumn("varchar", { length: 36 })
  group_id: string;

  @Column()
  name: string;

  @Column()
  created_by: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 100 })
  default_cost_limit: number;

  @CreateDateColumn()
  created_at: Date;

  creator?: User;

  @OneToMany(
    () => Quota,
    (quota) => quota.group,
  )
  quotas: Quota[];

  @OneToMany(
    () => UserGroup,
    (userGroup) => userGroup.group,
  )
  members: UserGroup[];

  @BeforeInsert()
  generateId() {
    if (!this.group_id) {
      this.group_id = uuidv7();
    }
  }
}
