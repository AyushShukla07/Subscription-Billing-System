import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import planRoutes from "./routes/planRoutes.js";
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import bodyParser from 'body-parser';
import webhookRoutes from './routes/webhookRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import premiumRoutes from './routes/premiumRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use("/api/webhook", bodyParser.raw({ type: "application/json" }), webhookRoutes);

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/premium-content", premiumRoutes);


//health route
app.get("/health", (req, res) => {
    res.status(200).json({ message: "API is running" });
});

export default app;