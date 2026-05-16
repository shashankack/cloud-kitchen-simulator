import Room from "../models/Room.js";

function generateRoomId() {
  return "room-" + Math.random().toString(36).substring(2, 8);
}

export async function createRoom(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const roomId = generateRoomId();
    const room = new Room({ roomId, name });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listRooms(req, res) {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getRoom(req, res) {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function toggleAutoScaling(req, res) {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    room.autoScalingEnabled = !room.autoScalingEnabled;
    await room.save();

    const io = req.app && req.app.get("io");
    if (io) {
      io.to(roomId).emit("room:updated", { autoScalingEnabled: room.autoScalingEnabled });
    }

    res.json({ autoScalingEnabled: room.autoScalingEnabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function toggleDeadlockMode(req, res) {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    room.allowUnsafeAllocation = !room.allowUnsafeAllocation;
    await room.save();

    const io = req.app && req.app.get("io");
    if (io) {
      io.to(roomId).emit("room:updated", { allowUnsafeAllocation: room.allowUnsafeAllocation });
    }

    res.json({ allowUnsafeAllocation: room.allowUnsafeAllocation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
