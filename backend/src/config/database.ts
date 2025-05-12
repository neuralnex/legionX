import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Listing } from '../entities/Listing';
import { Purchase } from '../entities/Purchase';
import { Agent } from '../entities/Agent';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Listing, Purchase, Agent],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/migrations/*.ts'],
  migrationsRun: true,
}); 