import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server as IoServer } from "socket.io";

import tasksRoutes from "./routes/tasks.js";
import serversRoutes from "./routes/servers.js";
import scheduleRoutes from "./routes/schedule.js";
import roomsRoutes from "./routes/rooms.js";
import errorHandler from "./middleware/errorHandler.js";
import { reconcileOverdueRunningTasks } from "./controllers/schedulerController.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

if (!MONGO_URI) {
  console.error("MONGO_URI is not set. Set it in .env and restart.");
  process.exit(1);
}

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/tasks", tasksRoutes);
app.use("/api/servers", serversRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/rooms", roomsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

app.use(errorHandler);

const httpServer = createServer(app);

const io = new IoServer(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", async (socket) => {
  const roomId = socket.handshake.query.roomId;

  if (!roomId) {
    console.log("Client connected without roomId, disconnecting", socket.id);
    socket.disconnect();
    return;
  }

  socket.join(roomId);
  console.log("Client connected to room", roomId, socket.id);

  reconcileOverdueRunningTasks(io, roomId).catch((err) => {
    console.error("Room overdue task sweep error:", err);
  });

  try {
    const Task = (await import("./models/Task.js")).default;
    const ServerModel = (await import("./models/Server.js")).default;

    const tasks = await Task.find({ roomId }).populate("assignedServer");
    const servers = await ServerModel.find({ roomId });

    socket.emit("init", { tasks, servers, roomId });
  } catch (e) {
    console.error("Error sending init state:", e.message);
  }

  // Allow clients to request an immediate authoritative refresh via socket
  socket.on("tasks:refresh", async (payload) => {
    try {
      const Task = (await import("./models/Task.js")).default;
      const ServerModel = (await import("./models/Server.js")).default;
      const tasks = await Task.find({ roomId }).populate("assignedServer");
      const servers = await ServerModel.find({ roomId });
      // emit full init payload so client's existing `init` handler updates state
      socket.emit("init", { tasks, servers, roomId });
    } catch (err) {
      console.error("Error handling tasks:refresh:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected from room", roomId, socket.id);
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    const overdueSweepInterval = setInterval(() => {
      reconcileOverdueRunningTasks(io).catch((err) => {
        console.error("Overdue task sweep error:", err);
      });
    }, 500);

    if (typeof overdueSweepInterval.unref === "function") {
      overdueSweepInterval.unref();
    }

    httpServer.listen(PORT, () => {
      console.log(`Server with sockets is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
