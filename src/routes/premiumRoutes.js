import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { requireActiveSubscription } from "../middlewares/requireSubscription.js";

const router = express.Router();

router.get(
    "/",
    auth,
    requireActiveSubscription,
    (req, res) => {
        res.json({
            message: "Access granted",
            data: "This is Premium content"
        });
    }
);

export default router;