import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  ipfsHash!: string;

  @ManyToOne(() => User, (user) => user.id)
  owner!: User;

  constructor(name: string, description: string, ipfsHash: string, owner: User) {
    this.name = name;
    this.description = description;
    this.ipfsHash = ipfsHash;
    this.owner = owner;
  }
}
