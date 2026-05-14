import dotenv from "dotenv";
import mongoose from "mongoose";
import Server from "../models/Server.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
if (!MONGO_URI) {
  console.error("Set MONGO_URI in .env before running seed script");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding");
  const sample = [
    { name: "Server A", totalCPU: 16, totalRAM: 32 },
    { name: "Server B", totalCPU: 8, totalRAM: 16 },
    { name: "Server C", totalCPU: 32, totalRAM: 64 },
  ];
  await Server.deleteMany({});
  const docs = await Server.insertMany(sample);
  console.log("Inserted servers:", docs.map((d) => d.name).join(", "));
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
