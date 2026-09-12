import express from "express"; 
import cors from "cors"; 
import dotenv from "dotenv"; 
import {  prisma } from './db';

import authRouter from "./routes/auth";
import poolRouter from "./routes/pool";
import photoRouter from "./routes/photo";

dotenv.config(); 

const app = express(); 
app.use(cors()); 
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "db disconnected" });
  }
});

app.use("/auth", authRouter);
app.use("/pools", poolRouter);
app.use("/photos", photoRouter); 
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 4000; 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`); 
});