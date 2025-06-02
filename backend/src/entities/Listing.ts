import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User.js';
import { Agent } from './Agent.js';
import type { AIModelMetadata } from '../types/ai.js';
import { Purchase } from './Purchase.js';

@Entity()
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user: User) => user.listings)
  seller!: User;

  @ManyToOne(() => Agent, (agent: Agent) => agent.listings)
  agent!: Agent;

  @Column('decimal', { precision: 20, scale: 0 })
  price!: bigint;

  @Column('decimal', { precision: 20, scale: 0, nullable: true })
  fullPrice!: bigint;

  @Column('int')
  duration!: number;

  @Column('varchar', { nullable: true })
  subscriptionId?: string;

  @Column('jsonb')
  modelMetadata!: AIModelMetadata;

  @Column('varchar', { nullable: true })
  txHash!: string;

  @Column('integer', { nullable: true })
  confirmations!: number;

  @Column('varchar')
  metadataUri!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'sold', 'cancelled'],
    default: 'pending'
  })
  status!: 'pending' | 'active' | 'sold' | 'cancelled';

  @OneToMany(() => Purchase, (purchase: Purchase) => purchase.listing)
  purchases!: Purchase[];

  @Column('varchar')
  title!: string;

  @Column('text')
  description!: string;

  @Column('varchar')
  assetId!: string;

  @Column('varchar')
  ownerAddress!: string;

  @Column('boolean', { default: false })
  isPremium!: boolean;

  @Column('timestamp', { nullable: true })
  premiumExpiry!: Date;

  @Column('varchar', { nullable: true })
  premiumTxHash?: string;

  @Column('boolean', { default: false })
  isActive!: boolean;

  @Column('varchar', { nullable: true })
  listingFeeTxHash?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 