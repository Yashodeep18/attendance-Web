import express from "express";
import { deleteUser, getAllAttendance, getAllUsers } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/attendance", getAllAttendance);

export default router;
