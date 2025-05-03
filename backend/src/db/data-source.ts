import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Agent } from "../entities/Agent";
import { Listing } from "../entities/Listing";
import { Purchase } from "../entities/Purchase";
import { Fee } from "../entities/Fee";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [User, Agent, Listing, Purchase, Fee],
});
