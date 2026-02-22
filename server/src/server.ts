import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";

import cropRoutes from "./routes/cropRoutes";
import regionRoutes from "./routes/regionRoutes";
import estimateRoutes from "./routes/estimateRoutes";

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/crops", cropRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/estimate", estimateRoutes);

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Farmer Profitability Estimator API is running",
  });
});

const PORT: number = parseInt(process.env.PORT || "5001", 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
