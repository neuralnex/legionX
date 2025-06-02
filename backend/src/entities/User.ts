import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Listing } from './Listing.js';
import { Purchase } from './Purchase.js';
import { Agent } from './Agent.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: true })
  address?: string;

  @Column('varchar', { nullable: true })
  name?: string;

  @Column('varchar', { nullable: true })
  email?: string;

  @Column('varchar', { nullable: true })
  avatar?: string;

  @Column('varchar', { nullable: true })
  wallet?: string;

  @Column('boolean', { default: false })
  isVerified!: boolean;

  @Column('varchar', { nullable: true })
  verificationTxHash?: string;

  @Column('boolean', { default: false })
  isPremium!: boolean;

  @Column('timestamp', { nullable: true })
  premiumExpiry?: Date;

  @Column('varchar', { nullable: true })
  premiumTxHash?: string;

  @Column('boolean', { default: false })
  hasAnalyticsAccess!: boolean;

  @Column('timestamp', { nullable: true })
  analyticsExpiry?: Date;

  @Column('varchar', { nullable: true })
  analyticsTxHash?: string;

  @OneToMany(() => Listing, (listing: Listing) => listing.seller)
  listings!: Listing[];

  @OneToMany(() => Purchase, (purchase: Purchase) => purchase.buyer)
  purchases!: Purchase[];

  @OneToMany(() => Agent, (agent: Agent) => agent.creator)
  agents!: Agent[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 