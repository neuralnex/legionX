import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Agent } from "./Agent";
import { Listing } from "./Listing";
import { Purchase } from "./Purchase";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  wallet: string;

  @OneToMany(() => Agent, (agent) => agent.creator)
  agents: Agent[];

  @OneToMany(() => Listing, (listing) => listing.seller)
  listings: Listing[];

  @OneToMany(() => Purchase, (purchase) => purchase.buyer)
  purchases: Purchase[];
}
