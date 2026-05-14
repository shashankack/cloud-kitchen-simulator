import Task from "../models/Task.js";
import Server from "../models/Server.js";
import TaskLog from "../models/TaskLog.js";
import { cleanupIdleAutoScaledServers, runSchedulerLogic, cancelScheduledCompletion } from "./schedulerController.js";
import { generateRandomFailureMessage } from "../utils/failureMessages.js";

export const MAX_TASK_SEED_COUNT = 300;

function getSeedIntensityProfile(intensity = "normal") {
  const normalized = String(intensity || "normal").toLowerCase();

  if (normalized === "low") {
    return {
      cpuFactor: 0.6,
      ramFactor: 0.6,
      executionFactor: 0.85,
      cpuOffset: 0,
      ramOffset: 0,
    };
  }

  if (normalized === "high") {
    return {
      cpuFactor: 1.45,
      ramFactor: 1.5,
      executionFactor: 1.15,
      cpuOffset: 1,
      ramOffset: 2,
    };
  }

  return {
    cpuFactor: 1,
    ramFactor: 1,
    executionFactor: 1,
    cpuOffset: 0,
    ramOffset: 0,
  };
}

export async function createTask(req, res) {
  try {
    const { name, cpu, ram, priority, executionTime } = req.body;
    if (
      !name ||
      cpu == null ||
      ram == null ||
      priority == null ||
      executionTime == null
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (cpu <= 0 || ram <= 0)
      return res.status(400).json({ error: "CPU and RAM must be > 0" });

    const task = new Task({
      name,
      cpu,
      ram,
      priority,
      executionTime,
      roomId: req.roomId,
    });
    await task.save();

    // Populate before emitting and responding
    const populatedTask = await task.populate("assignedServer");

    // emit real-time event to room
    const io = req.app && req.app.get("io");
    if (io) io.to(req.roomId).emit("task:created", populatedTask);

    // Auto-schedule directly after creation
    if (io) {
      runSchedulerLogic(io, req.roomId).catch(console.error);
    }

    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listTasks(req, res) {
  try {
    const tasks = await Task.find({
      roomId: req.roomId,
    })
      .populate("assignedServer")
      .sort({ createdAt: -1 });
    // return tasks to client
    return res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listTaskLogs(req, res) {
  try {
    const logs = await TaskLog.find({ roomId: req.roomId }).sort({ createdAt: -1 }).limit(100);
    return res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function clearTaskLogs(req, res) {
  try {
    const result = await TaskLog.deleteMany({ roomId: req.roomId });

    const io = req.app && req.app.get("io");
    if (io) {
      io.to(req.roomId).emit("logs:reset");
    }

    res.json({ message: "Task logs cleared", deletedCount: result.deletedCount || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function seedTasks(req, res) {
  try {
    const count = Number(req.body.count) || 6;
    const intensity = req.body.intensity || "normal";

    if (count < 1) {
      return res.status(400).json({ error: "Task seed count must be at least 1" });
    }

    if (count > MAX_TASK_SEED_COUNT) {
      return res.status(400).json({
        error: `Task seed count cannot exceed ${MAX_TASK_SEED_COUNT}`,
      });
    }

    const samples = [
      { name: "Image Processing", cpu: 4, ram: 8, priority: 2, executionTime: 10 },
      { name: "Data Sync", cpu: 2, ram: 4, priority: 3, executionTime: 6 },
      { name: "Report Build", cpu: 6, ram: 12, priority: 1, executionTime: 20 },
      { name: "Video Encode", cpu: 8, ram: 16, priority: 2, executionTime: 30 },
      { name: "Thumbnail Gen", cpu: 1, ram: 1, priority: 3, executionTime: 3 },
      { name: "ML Inference", cpu: 10, ram: 24, priority: 1, executionTime: 45 },
    ];

    // Remove existing tasks for room before seeding
    await Task.deleteMany({ roomId: req.roomId });

    const profile = getSeedIntensityProfile(intensity);

    const docs = Array.from({ length: count }, (_, i) => {
      const sample = samples[i % samples.length];
      const cpu = Math.max(1, Math.round(sample.cpu * profile.cpuFactor) + profile.cpuOffset);
      const ram = Math.max(1, Math.round(sample.ram * profile.ramFactor) + profile.ramOffset);
      const executionTime = Math.max(
        1,
        Math.round(sample.executionTime * profile.executionFactor),
      );

      return {
        name: `${sample.name}${count > 1 ? ` #${i + 1}` : ""}`,
        cpu,
        ram,
        priority: sample.priority,
        executionTime,
        roomId: req.roomId,
      };
    });

    const io = req.app && req.app.get("io");

    // Emit start progress
    if (io) io.to(req.roomId).emit("seed:progress", { stage: "start", value: 0 });

    // Batch insert to allow progress updates and avoid huge single ops
    const batchSize = Math.max(50, Math.min(500, Math.ceil(docs.length / 10)));
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      await Task.insertMany(batch, { ordered: true });

      if (io) {
        const done = Math.min(i + batch.length, docs.length);
        const percent = Math.round((done / docs.length) * 100);
        io.to(req.roomId).emit("seed:progress", { stage: "update", value: percent });
      }
    }

    // Populate all tasks before sending
    const populatedDocs = await Task.find({ roomId: req.roomId })
      .populate("assignedServer")
      .sort({ createdAt: -1 });

    if (io) {
      io.to(req.roomId).emit("tasks:seeded", populatedDocs);
      io.to(req.roomId).emit("seed:progress", { stage: "finish" });
      // run scheduler after seeding
      runSchedulerLogic(io, req.roomId).catch(console.error);
    }

    res.json(populatedDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Extract logic for programmatic completion
export async function completeTaskLogic(id, io, forceStatus = null) {
  const task = await Task.findById(id);
  if (!task) throw new Error("Task not found");

  const roomId = task.roomId;

  if (task.status !== "running") throw new Error("Task is not running");

  // free server resources
  let serverName = "Unknown";
  let serverId = null;
  if (task.assignedServer) {
    const server = await Server.findById(task.assignedServer);
    if (server) {
      serverName = server.name;
      serverId = server._id;

      // Recompute server usage based on remaining running tasks assigned to this server.
      // Exclude the task that is being completed so the server can actually drain to zero.
      const runningTasksOnServer = await Task.find({
        assignedServer: server._id,
        status: "running",
        _id: { $ne: task._id },
      });

      const sumCPU = runningTasksOnServer.reduce((acc, t) => acc + (t.cpu || 0), 0);
      const sumRAM = runningTasksOnServer.reduce((acc, t) => acc + (t.ram || 0), 0);

      server.usedCPU = Math.max(0, sumCPU);
      server.usedRAM = Math.max(0, sumRAM);

      await server.save();

      if (io) io.to(roomId).emit("server:updated", server);

      // Auto-remove idle auto-scaled servers
      if (server.isAutoScaled && server.usedCPU === 0 && server.usedRAM === 0) {
        await Server.findByIdAndDelete(serverId);
        if (io) {
          io.to(roomId).emit("server:removed", { serverId: server._id });
        }
      }
    }
  }

  // 15% random failure chance simulation, unless forcefully setting status
  if (forceStatus) {
    task.status = forceStatus;
  } else {
    const failed = Math.random() < 0.15;
    task.status = failed ? "failed" : "completed";
    // Generate failure reason if task failed
    if (task.status === "failed") {
      task.failureReason = generateRandomFailureMessage();
    }
  }
  await task.save();

  // Create Historical Log
  const waitTime = Math.max(
    0,
    (Date.now() - new Date(task.createdAt).getTime()) / 1000 -
      task.executionTime,
  );
  const log = new TaskLog({
    roomId,
    taskId: task._id,
    taskName: task.name,
    serverId: task.assignedServer,
    serverName: serverName,
    status: task.status,
    cpu: task.cpu,
    ram: task.ram,
    executionTime: task.executionTime,
    waitTime: waitTime,
  });
  await log.save();

  // Populate task before emitting
  const populatedTask = await task.populate("assignedServer");
  if (io) io.to(roomId).emit("task:updated", populatedTask);
  if (io) io.to(roomId).emit("log:created", log);

  return populatedTask;
}

export async function retryTask(req, res) {
  try {
    const { id } = req.params;
    const io = req.app && req.app.get("io");

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.roomId !== req.roomId) {
      return res.status(403).json({ error: "Task does not belong to this room" });
    }

    if (task.status !== "failed") {
      return res.status(400).json({ error: "Only failed tasks can be retried" });
    }

    // Cancel any previously scheduled automatic completion for this task
    try { cancelScheduledCompletion(task._id); } catch (e) { /* ignore */ }

    task.status = "waiting";
    task.startedAt = null;
    task.assignedServer = null;
    task.allocationMethod = null;
    task.failureReason = null;
    await task.save();

    const populatedTask = await task.populate("assignedServer");

    if (io) {
      io.to(req.roomId).emit("task:updated", populatedTask);
      runSchedulerLogic(io, req.roomId).catch(console.error);
    }

    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function retryAllFailedTasks(req, res) {
  try {
    const io = req.app && req.app.get("io");
    const failedTasks = await Task.find({ roomId: req.roomId, status: "failed" });

    if (failedTasks.length === 0) {
      return res.json({ retried: 0, tasks: [] });
    }

    const failedTaskIds = failedTasks.map((task) => task._id);
    for (const task of failedTasks) {
      try { cancelScheduledCompletion(task._id); } catch (e) { /* ignore */ }
    }

    await Task.updateMany(
      { _id: { $in: failedTaskIds } },
      {
        $set: {
          status: "waiting",
          startedAt: null,
          assignedServer: null,
          allocationMethod: null,
          failureReason: null,
        },
      },
    );

    const updatedTasks = await Task.find({
      _id: { $in: failedTaskIds },
      roomId: req.roomId,
    }).populate("assignedServer");

    if (io) {
      io.to(req.roomId).emit("tasks:updated", updatedTasks);
      for (const task of updatedTasks) {
        io.to(req.roomId).emit("task:updated", task);
      }
      runSchedulerLogic(io, req.roomId).catch(console.error);
    }

    res.json({ retried: updatedTasks.length, tasks: updatedTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function completeTask(req, res) {
  try {
    const { id } = req.params;
    const io = req.app && req.app.get("io");
    const task = await completeTaskLogic(id, io, "completed"); // manual complete always succeeds

    // If completed manually, maybe we can run the scheduler again
    // Cancel any scheduled auto-completion for this task (manual override)
    try { cancelScheduledCompletion(id); } catch (e) { /* ignore */ }

    if (io) {
      runSchedulerLogic(io, req.roomId).catch(console.error);
      cleanupIdleAutoScaledServers(io, req.roomId).catch(console.error);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function resetTasks(req, res) {
  try {
    // Cancel any scheduled completions for tasks in this room, then delete all tasks
    const tasksInRoom = await Task.find({ roomId: req.roomId }).select("_id");
    for (const t of tasksInRoom) {
      try { cancelScheduledCompletion(t._id); } catch (e) { /* ignore */ }
    }
    await Task.deleteMany({ roomId: req.roomId });
    await TaskLog.deleteMany({ roomId: req.roomId });

    const io = req.app && req.app.get("io");
    if (io) {
      io.to(req.roomId).emit("tasks:reset");
      io.to(req.roomId).emit("logs:reset");
    }

    res.json({ message: "Tasks reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
