import express from 'express';
import { refundPayment } from '../controllers/refundController.js';
import { auth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', auth, refundPayment);

export default router;