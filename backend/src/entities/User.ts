import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Listing } from './Listing.js';
import { Purchase } from './Purchase.js';
import { Agent } from './Agent.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { unique: true, nullable: false })
  email!: string;

  @Column('varchar', { unique: true, nullable: false })
  username!: string;

  @Column('varchar', { nullable: false })
  firstName!: string;

  @Column('varchar', { nullable: false })
  lastName!: string;

  @Column('varchar', { nullable: true })
  passwordHash?: string;

  @Column('varchar', { nullable: true })
  address?: string;

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

  @Column('varchar', { nullable: true })
  refreshToken?: string;

  @Column('timestamp', { nullable: true })
  lastLoginAt?: Date;

  @Column('int', { default: 0 })
  listingPoints!: number;

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