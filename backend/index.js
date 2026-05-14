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

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/tasks", tasksRoutes);
app.use("/api/servers", serversRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/rooms", roomsRoutes);

// centralized error handler
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  console.error("MONGO_URI is not set. Set it in .env and restart.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // create HTTP server and attach socket.io for real-time updates
    const httpServer = createServer(app);
    const io = new IoServer(httpServer, { cors: { origin: "*" } });

    // attach io to app so controllers can emit
    app.set("io", io);

    const overdueSweepInterval = setInterval(() => {
      reconcileOverdueRunningTasks(io).catch((err) => {
        console.error("Overdue task sweep error:", err);
      });
    }, 2000);

    if (typeof overdueSweepInterval.unref === "function") {
      overdueSweepInterval.unref();
    }

    io.on("connection", async (socket) => {
      // extract roomId from query params (client should pass ?roomId=xxx)
      const roomId = socket.handshake.query.roomId;
      if (!roomId) {
        console.log(
          "Client connected without roomId, disconnecting",
          socket.id,
        );
        socket.disconnect();
        return;
      }

      // join socket room
      socket.join(roomId);
      console.log("Client connected to room", roomId, socket.id);

      reconcileOverdueRunningTasks(io, roomId).catch((err) => {
        console.error("Room overdue task sweep error:", err);
      });

      try {
        // send initial state to this client with populated tasks
        const Task = (await import("./models/Task.js")).default;
        const ServerModel = (await import("./models/Server.js")).default;
        const tasks = await Task.find({
          roomId,
        }).populate("assignedServer");
        const servers = await ServerModel.find({
          roomId,
        });
        socket.emit("init", { tasks, servers, roomId });
      } catch (e) {
        console.error("Error sending init state:", e.message);
      }

      socket.on("disconnect", () => {
        console.log("Client disconnected from room", roomId, socket.id);
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`Server (with sockets) is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
