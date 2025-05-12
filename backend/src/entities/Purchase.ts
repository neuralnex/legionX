import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Listing } from './Listing';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, user => user.purchases)
  buyer!: User;

  @ManyToOne(() => Listing, listing => listing.purchases)
  listing!: Listing;

  @Column('decimal', { precision: 20, scale: 0 })
  amount!: bigint;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  })
  status!: 'pending' | 'completed' | 'failed';

  @Column({ nullable: true })
  txHash!: string;

  @Column({ nullable: true })
  confirmations!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 