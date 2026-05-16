import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    autoScalingEnabled: {
      type: Boolean,
      default: true,
    },
    // When true the scheduler will bypass the Banker's safety check
    // to allow intentionally unsafe allocations (useful for deadlock simulation).
    allowUnsafeAllocation: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
