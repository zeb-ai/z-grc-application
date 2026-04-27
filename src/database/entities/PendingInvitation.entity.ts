import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { v7 as uuidv7 } from "uuid";

@Entity("pending_invitations")
export class PendingInvitation {
  @PrimaryColumn("varchar", { length: 36 })
  id!: string;

  @Column()
  email!: string;

  @Column()
  group_id!: string;

  @Column({ type: "varchar", length: 20 })
  role!: "admin" | "member";

  @Column({
    type: "varchar",
    length: 20,
    default: "pending",
  })
  status!: "pending" | "accepted" | "cancelled";

  @CreateDateColumn()
  created_at!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }
}
