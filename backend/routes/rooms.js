import express from "express";
import { createRoom, listRooms, getRoom } from "../controllers/roomController.js";

const router = express.Router();

router.post("/", createRoom);
router.get("/", listRooms);
router.get("/:roomId", getRoom);

export default router;
