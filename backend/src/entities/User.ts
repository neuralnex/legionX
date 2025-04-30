import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  walletAddress!: string;

  @Column()
  email!: string;

  constructor(walletAddress: string, email: string) {
    this.walletAddress = walletAddress;
    this.email = email;
  }
}
