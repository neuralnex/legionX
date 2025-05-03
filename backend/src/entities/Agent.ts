import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Agent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  modelVersion!: string;

  @Column()
  metadataUri!: string;

  @ManyToOne(() => User, (user) => user.agents)
  @JoinColumn({ name: "creator_id" })
  creator!: User;
}
