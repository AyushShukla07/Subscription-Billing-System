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

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/webhook", bodyParser.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscription", subscriptionRoutes);


//health route
app.get("/health", (req, res) => {
    res.status(200).json({ message: "API is running" });
});

export default app;