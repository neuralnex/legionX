import express from "express";
import apiRoutes from './routes';
import dotenv from "dotenv";
import cors from "cors";
import { AppDataSource } from "./db/data-source";
import authRoutes from './routes/auth';
import { authMiddleware } from "./middleware/auth";
import { startDBsyncMonitor } from "./dbsync";
startDBsyncMonitor();


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);
app.use('/auth', authRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
