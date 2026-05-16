import dotenv from "dotenv";
import mongoose from "mongoose";
import Room from "../models/Room.js";
import Server from "../models/Server.js";
import Task from "../models/Task.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
if (!MONGO_URI) {
  console.error("Set MONGO_URI in .env before running seed-deadlock script");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for deadlock seeding");

  // Create or reset the deadlock room
  const ROOM_ID = process.env.DEADLOCK_ROOM_ID || "deadlock-room";
  await Room.deleteMany({ roomId: ROOM_ID });
  const room = new Room({ roomId: ROOM_ID, name: "Deadlock Room", allowUnsafeAllocation: true });
  await room.save();
  console.log(`Created room ${ROOM_ID} with allowUnsafeAllocation=true`);

  // Remove existing servers/tasks in that room
  await Server.deleteMany({ roomId: ROOM_ID });
  await Task.deleteMany({ roomId: ROOM_ID });

  // Create two small servers that together cannot satisfy all waiting tasks unless allocation is done carefully
  const servers = [
    { name: "Server A", roomId: ROOM_ID, totalCPU: 4, totalRAM: 4, usedCPU: 0, usedRAM: 0, status: "active" },
    { name: "Server B", roomId: ROOM_ID, totalCPU: 4, totalRAM: 4, usedCPU: 0, usedRAM: 0, status: "active" },
  ];
  const createdServers = await Server.insertMany(servers);
  console.log("Inserted servers:", createdServers.map((s) => s.name).join(", "));

  // Create four tasks that each need 3 CPU; with naive greedy allocation and unsafe allocations enabled
  // it's possible to allocate tasks in a way that causes others to remain waiting (simulates deadlock-like state)
  const tasks = [
    { name: "T1", cpu: 3, ram: 0, priority: 2, status: "waiting", roomId: ROOM_ID, executionTime: 300 },
    { name: "T2", cpu: 3, ram: 0, priority: 2, status: "waiting", roomId: ROOM_ID, executionTime: 300 },
    { name: "T3", cpu: 3, ram: 0, priority: 2, status: "waiting", roomId: ROOM_ID, executionTime: 300 },
    { name: "T4", cpu: 3, ram: 0, priority: 2, status: "waiting", roomId: ROOM_ID, executionTime: 300 },
  ];

  const createdTasks = await Task.insertMany(tasks);
  console.log("Inserted tasks:", createdTasks.map((t) => t.name).join(", "));

  console.log("");
  console.log("Deadlock simulation seeded.");
  console.log("Run the scheduler endpoint to see allocation behavior (banker's safety is bypassed for this room).");
  console.log("Trigger via: POST /api/schedule/trigger with JSON body { roomId: 'deadlock-room' }");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
