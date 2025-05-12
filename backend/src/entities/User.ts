import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Listing } from './Listing';
import { Purchase } from './Purchase';
import { Agent } from './Agent';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  wallet!: string;

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