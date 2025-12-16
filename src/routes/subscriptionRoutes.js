import express from 'express';
import { createCheckoutSession } from '../controllers/subscriptionController.js';
import { cancelSubscription } from '../controllers/subscriptionController.js';
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/checkout", auth, createCheckoutSession);
router.post("/cancel", auth, cancelSubscription);

export default router;