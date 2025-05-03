// src/entities/Fee.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Purchase } from "./Purchase";

@Entity()
export class Fee {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Purchase, (purchase) => purchase.fees)
  purchase: Purchase;

  @Column()
  feeAmount: number;

  @Column()
  purchaseId: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  recordedAt: Date;
}
