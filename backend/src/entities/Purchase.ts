import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Listing } from './Listing';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Listing, listing => listing.purchases)
  listing: Listing;

  @ManyToOne(() => User, user => user.purchases)
  buyer: User;

  @Column()
  txHash: string;

  @Column('decimal', { precision: 20, scale: 6 })
  amount: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed'],
    default: 'pending'
  })
  status: 'pending' | 'confirmed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 