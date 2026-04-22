import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("pending_invitations")
export class PendingInvitation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  group_id!: number;

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
}
