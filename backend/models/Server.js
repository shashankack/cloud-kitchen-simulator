import mongoose from "mongoose";

const serverSchema = new mongoose.Schema({
  name: String,
  totalCPU: Number,
  totalRAM: Number,
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  usedCPU: {
    type: Number,
    default: 0,
  },
  usedRAM: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "maintenance"],
    default: "active",
  },
  isAutoScaled: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Server", serverSchema);
