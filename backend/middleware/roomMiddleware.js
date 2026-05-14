import Room from "../models/Room.js";

export async function validateRoomId(req, res, next) {
  const roomId = req?.body?.roomId || req?.query?.roomId;
  if (!roomId) {
    return res.status(400).json({ error: "roomId is required" });
  }

  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    // attach room to request for later use
    req.room = room;
    req.roomId = roomId;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
