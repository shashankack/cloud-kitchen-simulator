import express from "express";
import { triggerScheduler } from "../controllers/schedulerController.js";
import { validateRoomId } from "../middleware/roomMiddleware.js";

const router = express.Router();

router.post("/trigger", validateRoomId, triggerScheduler);

export default router;
