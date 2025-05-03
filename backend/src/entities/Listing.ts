// src/entities/Listing.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Listing {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.listings)
  seller!: User;

  policyId: string;

  @Column()
  assetName: string;

  @Column()
  unit: string;

  @Column()
  metadataUri: string;

  @Column()
  price: number;

  @Column()
  fullPrice: number;

  @Column()
  duration: number;

  @Column({ nullable: true })
  agent?: string;

  @Column({ nullable: true })
  txHash?: string;

  @Column()
  sellerAddress: string;

  @ManyToOne(() => User, (user) => user.listings)
  user: User;
  
  @ManyToOne(() => User, (user) => user.id)
  owner: User;

  //@Column({ default: "active" })
  //status: "active" | "sold" | "cancelled";

  @Column({ nullable: true })
  subscriptionId?: string;

  @Column({ type: "varchar" })
  status: "active" | "sold" | "cancelled" | "confirmed";


  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
