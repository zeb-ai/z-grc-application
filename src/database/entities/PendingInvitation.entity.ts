import {
  Entity,
  Column,
  CreateDateColumn,
  ObjectIdColumn,
  BeforeInsert,
} from "typeorm";

@Entity("pending_invitations")
export class PendingInvitation {
  @ObjectIdColumn()
  _id!: string;

  @Column({ unique: true })
  id!: number;

  @Column()
  email!: string;

  @Column()
  group_id!: number;

  @Column({ type: "enum", enum: ["admin", "member"] })
  role!: "admin" | "member";

  @Column({
    type: "enum",
    enum: ["pending", "accepted", "cancelled"],
    default: "pending",
  })
  status!: "pending" | "accepted" | "cancelled";

  @CreateDateColumn()
  created_at!: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = Date.now();
    }
  }
}
