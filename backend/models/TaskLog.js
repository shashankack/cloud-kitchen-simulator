import mongoose from "mongoose";

const taskLogSchema = new mongoose.Schema(
  {
    roomId: { type: String, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    taskName: String,
    serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server" },
    serverName: String,
    status: String, // "completed" or "failed"
    cpu: Number,
    ram: Number,
    executionTime: Number,
    waitTime: Number,
  },
  { timestamps: true }
);

export default mongoose.model("TaskLog", taskLogSchema);