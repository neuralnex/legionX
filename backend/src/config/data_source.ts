import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Agent } from '../entities/Agent';
import { Listing } from '../entities/Listing';
import { User } from '../entities/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '8081'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Agent, Listing, User],
  migrations: [],
  subscribers: [],
});
