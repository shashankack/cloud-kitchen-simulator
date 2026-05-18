import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cpu: {
      type: Number,
      required: true,
    },
    ram: {
      type: Number,
      required: true,
    },
    priority: {
      type: Number, // 1 = High, 2 = Medium, 3 = Low
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "running", "paused", "completed", "failed"],
      default: "waiting",
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    assignedServer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      default: null,
    },
    executionTime: {
      type: Number, // in seconds
      required: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    remainingExecutionMs: {
      type: Number,
      default: null,
    },
    allocationMethod: {
      type: String,
      enum: ["bankers", "idle-fill"],
      default: null,
    },
      failureReason: {
        type: String,
        default: null,
      },
  },
  { timestamps: true },
);

export default mongoose.model("Task", taskSchema);
