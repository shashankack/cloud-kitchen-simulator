import Server from "../models/Server.js";
import { AUTO_SCALE_LIMITS, runSchedulerLogic } from "./schedulerController.js";

export async function createServer(req, res) {
  try {
    const { name, totalCPU, totalRAM } = req.body;
    if (!name || totalCPU == null || totalRAM == null)
      return res.status(400).json({ error: "Missing fields" });
    const server = new Server({
      name,
      totalCPU,
      totalRAM,
      roomId: req.roomId,
    });
    await server.save();

    // emit real-time event to room
    const io = req.app && req.app.get("io");
    if (io) {
      io.to(req.roomId).emit("server:created", server);
      // Auto-schedule after server creation
      runSchedulerLogic(io, req.roomId).catch(console.error);
    }

    res.status(201).json(server);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listServers(req, res) {
  try {
    const servers = await Server.find({
      roomId: req.roomId,
    }).sort({ name: 1 });
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function seedServers(req, res) {
  try {
    const count = Number(req.body.count) || 3;

    const baseSamples = [
      { name: "Server", totalCPU: 16, totalRAM: 32 },
      { name: "Server", totalCPU: 8, totalRAM: 16 },
      { name: "Server", totalCPU: 32, totalRAM: 64 },
      { name: "Server", totalCPU: 4, totalRAM: 8 },
      { name: "Server", totalCPU: 64, totalRAM: 128 },
    ];

    // remove existing servers for room
    await Server.deleteMany({ roomId: req.roomId });

    const docsToInsert = [];
    for (let i = 0; i < count; i++) {
      const sample = baseSamples[i % baseSamples.length];
      docsToInsert.push({
        name: `${sample.name} ${String.fromCharCode(65 + (i % 26))}`,
        totalCPU: sample.totalCPU,
        totalRAM: sample.totalRAM,
        roomId: req.roomId,
      });
    }

    const docs = await Server.insertMany(docsToInsert);

    // emit real-time event to room with seeded servers
    const io = req.app && req.app.get("io");
    if (io) {
      io.to(req.roomId).emit("servers:seeded", docs);
      runSchedulerLogic(io, req.roomId).catch(console.error);
    }

    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAutoScaledServer(req, res) {
  try {
    const { totalCPU, totalRAM } = req.body;
    if (totalCPU == null || totalRAM == null)
      return res.status(400).json({ error: "Missing fields" });

    const normalizedCPU = Math.max(
      AUTO_SCALE_LIMITS.minCPU,
      Math.min(AUTO_SCALE_LIMITS.maxCPU, Number(totalCPU) || 0),
    );
    const normalizedRAM = Math.max(
      AUTO_SCALE_LIMITS.minRAM,
      Math.min(AUTO_SCALE_LIMITS.maxRAM, Number(totalRAM) || 0),
    );

    // Find next available letter
    const existingServers = await Server.find({
      roomId: req.roomId,
      isAutoScaled: true,
    }).sort({ name: -1 });

    let letter = "A";
    if (existingServers.length > 0) {
      const lastServer = existingServers[0];
      const lastLetter = lastServer.name.charAt(lastServer.name.length - 1);
      letter = String.fromCharCode(lastLetter.charCodeAt(0) + 1);
    }

    const server = new Server({
      name: `Server ${letter}`,
      totalCPU: normalizedCPU,
      totalRAM: normalizedRAM,
      roomId: req.roomId,
      isAutoScaled: true,
    });
    await server.save();

    const io = req.app && req.app.get("io");
    if (io) {
      io.to(req.roomId).emit("server:created", server);
      runSchedulerLogic(io, req.roomId).catch(console.error);
    }

    res.status(201).json(server);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeServer(req, res) {
  try {
    const { serverId } = req.params;

    const server = await Server.findById(serverId);
    if (!server || server.roomId !== req.roomId) {
      return res.status(404).json({ error: "Server not found" });
    }

    // Check if server has any allocated resources
    if (server.usedCPU > 0 || server.usedRAM > 0) {
      return res.status(400).json({
        error: "Cannot remove server with allocated resources",
      });
    }

    await Server.findByIdAndDelete(serverId);

    const io = req.app && req.app.get("io");
    if (io) {
      io.to(req.roomId).emit("server:removed", { serverId });
    }

    res.json({ message: "Server removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function removeIdleAutoScaledServers(req, res) {
  try {
    // Remove all auto-scaled servers with no allocated resources
    const result = await Server.deleteMany({
      roomId: req.roomId,
      isAutoScaled: true,
      usedCPU: 0,
      usedRAM: 0,
    });

    const io = req.app && req.app.get("io");
    if (io) {
      io.to(req.roomId).emit("autoScaledServers:removed", {
        deletedCount: result.deletedCount,
      });
    }

    res.json({
      message: `Removed ${result.deletedCount} idle auto-scaled servers`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function resetServers(req, res) {
  try {
    // BEFORE DELETING SERVERS, detach all running tasks to prevent orphaned references
    const Task = (await import("../models/Task.js")).default;
    await Task.updateMany(
      { roomId: req.roomId, status: "running" },
      {
        $set: {
          assignedServer: null,
          allocationMethod: null,
        },
      },
    );

    // delete all servers for the room
    await Server.deleteMany({ roomId: req.roomId });

    const io = req.app && req.app.get("io");
    if (io) {
      io.to(req.roomId).emit("servers:reset");
    }

    res.json({ message: "Servers reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
