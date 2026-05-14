import express from "express";
import {
  createServer,
  listServers,
  seedServers,
  resetServers,
  createAutoScaledServer,
  removeServer,
  removeIdleAutoScaledServers,
} from "../controllers/serverController.js";
import { validateServer } from "../middleware/validation.js";
import { validateRoomId } from "../middleware/roomMiddleware.js";

const router = express.Router();

router.post("/", validateRoomId, validateServer, createServer);
router.get("/", validateRoomId, listServers);
router.post("/seed", validateRoomId, seedServers);
router.post("/reset", validateRoomId, resetServers);
router.post("/auto-scale", validateRoomId, createAutoScaledServer);
router.delete("/:serverId", validateRoomId, removeServer);
router.post("/cleanup/idle", validateRoomId, removeIdleAutoScaledServers);

export default router;
