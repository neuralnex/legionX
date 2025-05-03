import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import { applyMiddleware } from "./middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

applyMiddleware(app); // apply middleware
app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
