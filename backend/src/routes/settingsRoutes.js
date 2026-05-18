import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", getSettings);
router.put("/", updateSettings);

export default router;
