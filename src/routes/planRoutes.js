import express from 'express';
import { createPlan, getPlans, deletePlan } from "../controllers/planController.js";
import { auth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/create", auth, createPlan);
router.get("/", getPlans);
router.delete("/:id", auth, deletePlan);

export default router;