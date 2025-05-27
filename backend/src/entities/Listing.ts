import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Agent } from './Agent';
import { Purchase } from './Purchase';
import { AIModelMetadata } from '../types/model';

@Entity()
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.listings)
  seller!: User;

  @ManyToOne(() => Agent, agent => agent.listings)
  agent!: Agent;

  @Column('decimal', { precision: 20, scale: 0 })
  price!: bigint;

  @Column('decimal', { precision: 20, scale: 0, nullable: true })
  fullPrice!: bigint;

  @Column('int')
  duration!: number;

  @Column({ nullable: true })
  subscriptionId?: string;

  @Column('jsonb')
  modelMetadata!: AIModelMetadata;

  @Column({ nullable: true })
  txHash!: string;

  @Column({ nullable: true })
  confirmations!: number;

  @Column()
  metadataUri!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'sold', 'cancelled'],
    default: 'pending'
  })
  status!: 'pending' | 'active' | 'sold' | 'cancelled';

  @OneToMany(() => Purchase, purchase => purchase.listing)
  purchases!: Purchase[];

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  assetId!: string;

  @Column()
  ownerAddress!: string;

  @Column({ default: false })
  isPremium!: boolean;

  @Column({ nullable: true })
  premiumExpiry!: Date;

  @Column({ nullable: true })
  premiumTxHash?: string;

  @Column({ default: false })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 