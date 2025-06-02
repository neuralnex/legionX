import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User.js';
import { Listing } from './Listing.js';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  name!: string;

  @Column('text')
  description!: string;

  @Column('varchar')
  modelVersion!: string;

  @Column('varchar')
  metadataUri!: string;

  @ManyToOne(() => User, (user: User) => user.agents)
  creator!: User;

  @OneToMany(() => Listing, (listing: Listing) => listing.agent)
  listings!: Listing[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 