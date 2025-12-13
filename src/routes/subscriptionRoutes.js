import express from 'express';
import { createCheckoutSession } from '../controllers/subscriptionController.js';
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/checkout", auth, createCheckoutSession);

export default router;