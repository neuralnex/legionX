import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User.js';
import { Listing } from './Listing.js';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user: User) => user.purchases)
  buyer!: User;

  @ManyToOne(() => Listing, (listing: Listing) => listing.purchases)
  listing!: Listing;

  @Column('decimal', { precision: 20, scale: 0 })
  price!: bigint;

  @Column('decimal', { precision: 20, scale: 0 })
  amount!: bigint;

  @Column('varchar', { nullable: true })
  txHash?: string;

  @Column('integer', { nullable: true })
  confirmations?: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  })
  status!: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column('varchar', { nullable: true })
  subscriptionId?: string;

  @Column('timestamp', { nullable: true })
  subscriptionExpiry?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 