import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Group } from "./Group.entity";
import type { User } from "./User.entity";

@Entity("user_group")
export class UserGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column()
  group_id: number;

  @Column({ type: "varchar", length: 20 })
  role: "admin" | "member";

  @CreateDateColumn()
  joined_at: Date;

  user?: User;
  group?: Group;
}
