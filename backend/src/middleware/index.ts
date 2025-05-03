import express from "express";
import { authMiddleware } from "./auth";

export const applyMiddleware = (app: express.Express) => {
  app.use(express.json()); // JSON body parsing
  app.use(authMiddleware as express.RequestHandler); // JWT auth middleware
};
