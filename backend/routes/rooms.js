import express from "express";
import { createRoom, listRooms, getRoom, toggleAutoScaling } from "../controllers/roomController.js";

const router = express.Router();

router.post("/", createRoom);
router.get("/", listRooms);
router.get("/:roomId", getRoom);
router.patch("/:roomId/auto-scaling", toggleAutoScaling);

export default router;
