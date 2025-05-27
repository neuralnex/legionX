import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Listing } from './Listing';
import { Purchase } from './Purchase';
import { Agent } from './Agent';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  wallet?: string;

  @Column({ default: false })
  hasAnalyticsAccess!: boolean;

  @Column({ nullable: true })
  analyticsExpiry!: Date;

  @Column({ nullable: true })
  analyticsTxHash?: string;

  @OneToMany(() => Listing, listing => listing.seller)
  listings!: Listing[];

  @OneToMany(() => Purchase, purchase => purchase.buyer)
  purchases!: Purchase[];

  @OneToMany(() => Agent, agent => agent.creator)
  agents!: Agent[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 