import express from "express";
import {
	triggerScheduler,
	pauseSchedulerForRoom,
	resumeSchedulerForRoom,
	rewindSchedulerForRoom,
} from "../controllers/schedulerController.js";
import { validateRoomId } from "../middleware/roomMiddleware.js";

const router = express.Router();

router.post("/trigger", validateRoomId, triggerScheduler);
router.post("/pause", validateRoomId, pauseSchedulerForRoom);
router.post("/resume", validateRoomId, resumeSchedulerForRoom);
router.post("/rewind", validateRoomId, rewindSchedulerForRoom);

export default router;
