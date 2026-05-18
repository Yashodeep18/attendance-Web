import express from "express";
import {
  clockIn,
  clockOut,
  getMyAttendanceRecords,
  getTodayAttendance,
} from "../controllers/attendanceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/clock-in", clockIn);
router.post("/clock-out", clockOut);
router.get("/today", getTodayAttendance);
router.get("/my-records", getMyAttendanceRecords);

export default router;
