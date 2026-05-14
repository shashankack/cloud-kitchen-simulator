import express from "express";
import {
  createTask,
  listTasks,
  listTaskLogs,
  clearTaskLogs,
  completeTask,
  retryTask,
  retryAllFailedTasks,
  seedTasks,
  resetTasks,
} from "../controllers/taskController.js";
import { validateTask } from "../middleware/validation.js";
import { validateRoomId } from "../middleware/roomMiddleware.js";

const router = express.Router();

router.post("/", validateRoomId, validateTask, createTask);
router.get("/", validateRoomId, listTasks);
router.get("/logs", validateRoomId, listTaskLogs);
router.delete("/logs", validateRoomId, clearTaskLogs);
router.post("/:id/complete", validateRoomId, completeTask);
router.post("/:id/retry", validateRoomId, retryTask);
router.post("/retry-all-failed", validateRoomId, retryAllFailedTasks);
router.post("/seed", validateRoomId, seedTasks);
router.post("/reset", validateRoomId, resetTasks);

export default router;
