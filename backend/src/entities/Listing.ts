import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Agent } from './Agent';

@Entity()
export class Listing {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Agent, (agent) => agent.id)
  agent!: Agent;

  @Column()
  price!: number;

  @Column({ nullable: true })
  fullPrice?: number;

  @Column({ nullable: true })
  duration?: number;

  @Column()
  type!: 'subscription' | 'ownership';

  @Column()
  listedAt!: Date;

  constructor(agent: Agent, price: number, type: 'subscription' | 'ownership', listedAt: Date, fullPrice?: number, duration?: number) {
    this.agent = agent;
    this.price = price;
    this.type = type;
    this.listedAt = listedAt;
    this.fullPrice = fullPrice;
    this.duration = duration;
  }
}
