import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Agent } from './Agent';
import { Purchase } from './Purchase';

@Entity()
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.listings)
  seller: User;

  @ManyToOne(() => Agent, agent => agent.listings)
  agent: Agent;

  @Column('decimal', { precision: 20, scale: 6 })
  price: string;

  @Column('decimal', { precision: 20, scale: 6 })
  fullPrice: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  subscriptionId: string;

  @Column()
  txHash: string;

  @Column()
  metadataUri: string;

  @Column({
    type: 'enum',
    enum: ['active', 'sold', 'cancelled'],
    default: 'active'
  })
  status: 'active' | 'sold' | 'cancelled';

  @OneToMany(() => Purchase, purchase => purchase.listing)
  purchases: Purchase[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 