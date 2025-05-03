// src/entities/Purchase.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Listing } from "./Listing";
import { User } from "./User";

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Listing)
  listing: Listing;

  @ManyToOne(() => User)
  buyer: User;

  @Column()
  txHash: string;

  @Column({ type: "varchar" })
  status: "pending" | "confirmed";

  @Column({ type: "bigint" })
  amount: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  purchasedAt: Date;
}
