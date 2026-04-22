import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { uuidv7 } from "uuidv7";
import { Group } from "./Group.entity";
import { Quota } from "./Quota.entity";
import { UserGroup } from "./UserGroup.entity";

@Entity("user")
export class User {
  @PrimaryColumn("varchar", { length: 36 })
  user_id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Column({ type: "boolean", default: false })
  is_superadmin: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @OneToMany(
    () => Group,
    (group) => group.creator,
  )
  created_groups: Group[];

  @OneToMany(
    () => Quota,
    (quota) => quota.user,
  )
  quotas: Quota[];

  @OneToMany(
    () => UserGroup,
    (userGroup) => userGroup.user,
  )
  user_groups: UserGroup[];

  @BeforeInsert()
  async generateUserId() {
    if (!this.user_id) {
      this.user_id = uuidv7();
    }
  }
}
