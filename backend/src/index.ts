import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data_source';

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (_, res) => {
  res.send('Marketplace Backend is Running!');
});

AppDataSource.initialize()
  .then(() => {
    console.log('📦 PostgreSQL Connected via TypeORM');
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => console.error('Database connection error:', error));
