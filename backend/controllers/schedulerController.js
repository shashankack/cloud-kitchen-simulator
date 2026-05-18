import Task from "../models/Task.js";
import Server from "../models/Server.js";

export const AUTO_SCALE_LIMITS = {
  minCPU: 16,
  minRAM: 32,
  maxCPU: 512,
  maxRAM: 1024,
};

// In-memory registry to track scheduled auto-completion timers
const scheduledCompletionTimers = new Map(); // taskId -> { timeoutId, roomId, dueAt }
// FIX: Prevent race condition in task completion - track tasks currently being completed
const tasksBeingCompleted = new Set(); // taskId
const schedulerRunsByRoom = new Map(); // roomId -> Promise

function getRemainingExecutionMs(task) {
  if (!task) return 0;
  if (typeof task.remainingExecutionMs === "number" && task.remainingExecutionMs > 0) {
    return task.remainingExecutionMs;
  }

  if (!task.startedAt) {
    return Math.max(0, (task.executionTime || 0) * 1000);
  }

  const elapsedMs = Date.now() - new Date(task.startedAt).getTime();
  return Math.max(0, (task.executionTime || 0) * 1000 - elapsedMs);
}

export function scheduleAutoCompletion(taskId, io, delayMs, roomId = null) {
  // clear existing if present
  const existing = scheduledCompletionTimers.get(String(taskId));
  if (existing) {
    clearTimeout(existing.timeoutId);
  }

  const timeoutId = setTimeout(async () => {
    scheduledCompletionTimers.delete(String(taskId));
    try {
      await completeTaskAutomatically(taskId, io);
    } catch (err) {
      console.error("Error in scheduled completion:", err);
    }
  }, delayMs);

  scheduledCompletionTimers.set(String(taskId), {
    timeoutId,
    roomId,
    dueAt: Date.now() + delayMs,
  });
  return timeoutId;
}

export function cancelScheduledCompletion(taskId) {
  const key = String(taskId);
  const entry = scheduledCompletionTimers.get(key);
  if (entry) {
    clearTimeout(entry.timeoutId);
    scheduledCompletionTimers.delete(key);
    return true;
  }
  return false;
}

export function cancelAllScheduledForRoom(roomId) {
  for (const [taskId, entry] of scheduledCompletionTimers.entries()) {
    if (roomId && entry.roomId !== roomId) continue;
    clearTimeout(entry.timeoutId);
    scheduledCompletionTimers.delete(taskId);
  }
}

async function pauseRunningTasksForRoom(io, roomId) {
  const runningTasks = await Task.find({ roomId, status: "running" });
  if (runningTasks.length === 0) return [];

  const updatedTasks = [];
  for (const task of runningTasks) {
    const remainingExecutionMs = getRemainingExecutionMs(task);
    cancelScheduledCompletion(task._id);
    task.status = "paused";
    task.pausedAt = new Date();
    task.remainingExecutionMs = remainingExecutionMs;
    await task.save();
    const populatedTask = await task.populate("assignedServer");
    updatedTasks.push(populatedTask);
    if (io) io.to(roomId).emit("task:updated", populatedTask);
  }

  return updatedTasks;
}

async function resumePausedTasksForRoom(io, roomId) {
  const pausedTasks = await Task.find({ roomId, status: "paused" });
  if (pausedTasks.length === 0) return [];

  const resumedTasks = [];
  for (const task of pausedTasks) {
    const remainingExecutionMs =
      typeof task.remainingExecutionMs === "number" && task.remainingExecutionMs > 0
        ? task.remainingExecutionMs
        : Math.max(0, (task.executionTime || 0) * 1000);

    task.status = "running";
    task.pausedAt = null;
    task.remainingExecutionMs = remainingExecutionMs;
    await task.save();

    const populatedTask = await task.populate("assignedServer");
    resumedTasks.push(populatedTask);
    if (io) io.to(roomId).emit("task:updated", populatedTask);
    scheduleAutoCompletion(task._id, io, remainingExecutionMs, roomId);
  }

  return resumedTasks;
}

async function rewindLatestTaskForRoom(io, roomId) {
  const latestTask = await Task.findOne({
    roomId,
    status: { $in: ["running", "paused"] },
  }).sort({ startedAt: -1, updatedAt: -1, createdAt: -1 });

  if (!latestTask) return null;

  cancelScheduledCompletion(latestTask._id);

  const server = latestTask.assignedServer
    ? await Server.findById(latestTask.assignedServer)
    : null;

  if (server) {
    const remainingTasks = await Task.find({
      roomId,
      assignedServer: server._id,
      status: { $in: ["running", "paused"] },
      _id: { $ne: latestTask._id },
    });

    server.usedCPU = remainingTasks.reduce((sum, task) => sum + (task.cpu || 0), 0);
    server.usedRAM = remainingTasks.reduce((sum, task) => sum + (task.ram || 0), 0);
    await server.save();

    if (io) io.to(roomId).emit("server:updated", server);

    if (server.isAutoScaled && server.usedCPU === 0 && server.usedRAM === 0) {
      await Server.findByIdAndDelete(server._id);
      if (io) io.to(roomId).emit("server:removed", { serverId: server._id });
    }
  }

  latestTask.status = "waiting";
  latestTask.startedAt = null;
  latestTask.pausedAt = null;
  latestTask.remainingExecutionMs = null;
  latestTask.assignedServer = null;
  latestTask.allocationMethod = null;
  await latestTask.save();

  const populatedTask = await latestTask.populate("assignedServer");
  if (io) io.to(roomId).emit("task:updated", populatedTask);

  return populatedTask;
}

function serverLoadRatio(server) {
  if (!server.totalCPU) return Infinity;
  return server.usedCPU / server.totalCPU;
}

function serverFitWaste(server, task) {
  return (
    Math.max(0, server.totalCPU - server.usedCPU - task.cpu) +
    Math.max(0, server.totalRAM - server.usedRAM - task.ram)
  );
}

function bankersSafety(processes, available) {
  // processes: [{ allocation: {cpu,ram}, need: {cpu,ram} }, ...]
  const n = processes.length;
  const finish = new Array(n).fill(false);
  let workCPU = available.cpu;
  let workRAM = available.ram;

  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < n; i++) {
      if (finish[i]) continue;
      const need = processes[i].need;
      if (need.cpu <= workCPU && need.ram <= workRAM) {
        // process can finish, release its allocation
        workCPU += processes[i].allocation.cpu;
        workRAM += processes[i].allocation.ram;
        finish[i] = true;
        changed = true;
      }
    }
  }

  return finish.every(Boolean);
}

function isIdleServer(server) {
  return (server.usedCPU || 0) === 0 && (server.usedRAM || 0) === 0;
}

function getServerFitCandidates(servers, task) {
  return servers
    .filter(
      (s) =>
        s.totalCPU - s.usedCPU >= task.cpu &&
        s.totalRAM - s.usedRAM >= task.ram,
    )
    .sort((a, b) => {
      const wasteDiff = serverFitWaste(a, task) - serverFitWaste(b, task);
      if (wasteDiff !== 0) return wasteDiff;

      const aIdle = isIdleServer(a) ? 0 : 1;
      const bIdle = isIdleServer(b) ? 0 : 1;
      if (aIdle !== bIdle) return aIdle - bIdle;

      return serverLoadRatio(a) - serverLoadRatio(b);
    });
}

function allocateOnIdleServers(waitingTasks, servers, allocations) {
  for (const task of waitingTasks) {
    if (task.status !== "waiting") continue;

    const candidates = getServerFitCandidates(servers, task).filter(
      isIdleServer,
    );
    if (candidates.length === 0) continue;

    const chosen = candidates[0];

    chosen.usedCPU += task.cpu;
    chosen.usedRAM += task.ram;
    task.assignedServer = chosen._id;
    task.status = "running";
    task.startedAt = new Date();
    task.allocationMethod = "idle-fill";

    allocations.push({
      taskId: task._id,
      serverId: chosen._id,
      task,
      phase: "idle-fill",
    });
  }
}

function buildAutoScaledServerSpecs(requiredCPU, requiredRAM) {
  const specs = [];
  let remainingCPU = Math.max(0, requiredCPU);
  let remainingRAM = Math.max(0, requiredRAM);

  while (remainingCPU > 0 || remainingRAM > 0) {
    const totalCPU = Math.min(
      AUTO_SCALE_LIMITS.maxCPU,
      Math.max(
        AUTO_SCALE_LIMITS.minCPU,
        Math.ceil(Math.max(remainingCPU * 1.2, AUTO_SCALE_LIMITS.minCPU)),
      ),
    );
    const totalRAM = Math.min(
      AUTO_SCALE_LIMITS.maxRAM,
      Math.max(
        AUTO_SCALE_LIMITS.minRAM,
        Math.ceil(Math.max(remainingRAM * 1.2, AUTO_SCALE_LIMITS.minRAM)),
      ),
    );

    specs.push({ totalCPU, totalRAM });
    remainingCPU = Math.max(0, remainingCPU - totalCPU);
    remainingRAM = Math.max(0, remainingRAM - totalRAM);
  }

  return specs;
}

function getNextAutoScaledServerName(servers) {
  const existingNames = new Set((servers || []).map((s) => s.name));

  for (let i = 0; i < 2000; i++) {
    const letter = String.fromCharCode(65 + (i % 26));
    const cycle = Math.floor(i / 26);
    const suffix = cycle === 0 ? "" : `${cycle}`;
    const candidate = `Server-${letter}${suffix}`;
    if (!existingNames.has(candidate)) return candidate;
  }

  return `Server-${Date.now()}`;
}

export async function triggerScheduler(req, res) {
  try {
    const step = Boolean(req?.body?.step || req?.query?.step);
    const allocations = await runSchedulerLogic(req.app.get("io"), req.roomId, {
      step,
    });
    res.json({ allocated: allocations.length, allocations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function reconcileOverdueRunningTasks(io, roomId = null) {
  const now = Date.now();
  const query = {
    status: "running",
    startedAt: { $ne: null },
  };

  if (roomId) {
    query.roomId = roomId;
  }

  const overdueTasks = await Task.find(query).sort({ startedAt: 1 });
  let completedCount = 0;

  for (const task of overdueTasks) {
    const startedAt = new Date(task.startedAt).getTime();
    // small early buffer to account for client-side "0s" display and clock drift
    const dueAt = startedAt + (task.executionTime || 0) * 1000 - 100;

    if (dueAt > now) continue;

    await completeTaskAutomatically(task._id, io);
    completedCount += 1;
  }

  return completedCount;
}

export async function runSchedulerLogic(io, roomId = null, options = {}) {
  const roomKey = roomId || "__all_rooms__";
  const inFlight = schedulerRunsByRoom.get(roomKey);
  if (inFlight) {
    return inFlight;
  }

  const runPromise = (async () => {
    let autoScalingEnabled = true;
    let allowUnsafeAllocation = false;
    if (roomId) {
      try {
        const Room = (await import("../models/Room.js")).default;
        const room = await Room.findOne({ roomId });
        if (room) {
          autoScalingEnabled = room.autoScalingEnabled !== false;
          allowUnsafeAllocation = room.allowUnsafeAllocation === true;
        } else {
          autoScalingEnabled = true;
        }
      } catch (e) {
        // default to enabled if room lookup fails
        autoScalingEnabled = true;
        allowUnsafeAllocation = false;
      }
    }

    // fetch waiting tasks sorted by priority (1=high)
    const waiting = await Task.find({
      roomId,
      status: "waiting",
    }).sort({
      priority: 1,
      cpu: -1,
      ram: -1,
      createdAt: 1,
    });
    const running = await Task.find({
      roomId,
      status: "running",
    });
    const servers = await Server.find({
      roomId,
      status: "active",
    });

    // Ensure server usage reflects actual running tasks (repair any drift)
    for (const server of servers) {
      const tasksOnServer = running.filter(
        (r) => r.assignedServer && r.assignedServer.equals(server._id),
      );
      const sumCPU = tasksOnServer.reduce((acc, t) => acc + (t.cpu || 0), 0);
      const sumRAM = tasksOnServer.reduce((acc, t) => acc + (t.ram || 0), 0);
      if (
        (server.usedCPU || 0) !== sumCPU ||
        (server.usedRAM || 0) !== sumRAM
      ) {
        server.usedCPU = sumCPU;
        server.usedRAM = sumRAM;
      }
    }

    const allocations = [];

    // precompute global totals
    const totalCPU = servers.reduce((acc, s) => acc + (s.totalCPU || 0), 0);
    const totalRAM = servers.reduce((acc, s) => acc + (s.totalRAM || 0), 0);

    // current allocated from running tasks (should equal sum of server.used)
    let allocatedCPU = servers.reduce((acc, s) => acc + (s.usedCPU || 0), 0);
    let allocatedRAM = servers.reduce((acc, s) => acc + (s.usedRAM || 0), 0);

    // Auto-Scaling: If CPU load > 80% or many waiting tasks, dynamically spawn new servers
    const cpuUtilization = totalCPU > 0 ? allocatedCPU / totalCPU : 0;
    const totalDemandCPU = waiting.reduce((acc, t) => acc + t.cpu, 0);
    const totalDemandRAM = waiting.reduce((acc, t) => acc + t.ram, 0);
    const availableCPU = totalCPU - allocatedCPU;
    const availableRAM = totalRAM - allocatedRAM;

    // Create servers if demand exceeds available resources AND auto-scaling is enabled
    if (
      autoScalingEnabled &&
      servers.length > 0 &&
      (cpuUtilization > 0.8 ||
        ((totalDemandCPU > availableCPU || totalDemandRAM > availableRAM) &&
          waiting.length > 0))
    ) {
      const requiredCPU = Math.max(totalDemandCPU - availableCPU, 0);
      const requiredRAM = Math.max(totalDemandRAM - availableRAM, 0);

      if (requiredCPU > 0 || requiredRAM > 0) {
        const newServerSpecs = buildAutoScaledServerSpecs(
          requiredCPU,
          requiredRAM,
        );

        for (const spec of newServerSpecs) {
          const serverName = getNextAutoScaledServerName(servers);
          const newServer = new Server({
            roomId,
            name: serverName,
            totalCPU: spec.totalCPU,
            totalRAM: spec.totalRAM,
            usedCPU: 0,
            usedRAM: 0,
            status: "active",
            isAutoScaled: true,
          });
          await newServer.save();
          servers.push(newServer);
          if (io) io.to(roomId).emit("server:created", newServer);
        }
      }
    }

    for (const task of waiting) {
      // find candidate servers with enough free resources (per-server fit)
      const candidates = getServerFitCandidates(servers, task);

      if (candidates.length === 0) continue;

      const chosen = candidates[0];

      // quick per-server capacity check: task must be able to fit on some server at all
      const maxServerCPU = Math.max(...servers.map((s) => s.totalCPU || 0));
      const maxServerRAM = Math.max(...servers.map((s) => s.totalRAM || 0));
      if (task.cpu > maxServerCPU || task.ram > maxServerRAM) continue;

      // --- PER-SERVER BANKER'S ALGORITHM CHECK ---
      // Simulate available resources on *this specific server*
      const serverAvailable = {
        cpu: chosen.totalCPU - chosen.usedCPU - task.cpu,
        ram: chosen.totalRAM - chosen.usedRAM - task.ram,
      };

      const processes = [];

      // Add running tasks assigned to *this specific server*
      const serverRunningTasks = running.filter(
        (r) => r.assignedServer && r.assignedServer.equals(chosen._id),
      );
      for (const r of serverRunningTasks) {
        processes.push({
          allocation: { cpu: r.cpu, ram: r.ram },
          need: { cpu: 0, ram: 0 },
        });
      }

      // the task we're about to allocate
      processes.push({
        allocation: { cpu: task.cpu, ram: task.ram },
        need: { cpu: 0, ram: 0 },
      });

      // To prevent total deadlock, also ensure other waiting tasks could theoretically finish
      for (const w of waiting) {
        if (w._id.equals(task._id)) continue;
        processes.push({
          allocation: { cpu: 0, ram: 0 },
          need: { cpu: w.cpu, ram: w.ram },
        });
      }

      const safe = bankersSafety(processes, serverAvailable);
      // If the room has deadlock-simulation enabled, bypass the safety check
      if (!allowUnsafeAllocation) {
        if (!safe) {
          continue; // unsafe, skip
        }
      }

      // allocate on chosen server
      chosen.usedCPU += task.cpu;
      chosen.usedRAM += task.ram;
      task.assignedServer = chosen._id;
      task.status = "running";
      task.startedAt = new Date();
      task.allocationMethod = "bankers";

      allocatedCPU += task.cpu;
      allocatedRAM += task.ram;

      // mark whether this allocation was unsafe (i.e., bankersSafety failed but allocation allowed)
      const unsafe = !safe && allowUnsafeAllocation;

      allocations.push({
        taskId: task._id,
        serverId: chosen._id,
        task,
        unsafe,
      });

      // If single-step mode requested, stop after performing one allocation
      if (options && options.step) {
        break;
      }
    }

    // Secondary pass: if Banker leaves waiting tasks behind, consume completely idle servers.
    const stillWaiting = waiting.filter((task) => task.status === "waiting");
    if (stillWaiting.length > 0) {
      allocateOnIdleServers(stillWaiting, servers, allocations);
    }

    // save changed servers and newly running tasks
    const savePromises = [];
    const modifiedServers = servers.filter((s) => s.isModified());
    for (const s of modifiedServers) savePromises.push(s.save());
    const justRunning = waiting.filter((t) => t.status === "running");
    for (const t of justRunning) savePromises.push(t.save());

    await Promise.allSettled(savePromises);

    // Emit individual task and server updates to ensure frontend sees all changes
    if (io && roomId) {
      for (const task of justRunning) {
        const populatedTask = await task.populate("assignedServer");
        io.to(roomId).emit("task:updated", populatedTask);
      }
      for (const server of modifiedServers) {
        io.to(roomId).emit("server:updated", server);
      }
      if (allocations.length > 0) {
        io.to(roomId).emit("schedule:allocations", {
          allocated: allocations.length,
          allocations,
        });
      }
    }

    // Set up auto-completion for newly allocated tasks (use registry)
    for (const alloc of allocations) {
      const taskData = alloc.task;
      const timeMs = (taskData.executionTime || 5) * 1000;
      try {
        if (!alloc.unsafe) {
          scheduleAutoCompletion(taskData._id, io, timeMs, roomId);
        }
      } catch (err) {
        console.error("Failed to schedule auto-completion:", err);
      }
    }

    return allocations;
  })().finally(() => {
    schedulerRunsByRoom.delete(roomKey);
  });

  schedulerRunsByRoom.set(roomKey, runPromise);
  return runPromise;
}

export async function completeTaskAutomatically(taskId, io) {
  const taskIdStr = String(taskId);
  if (tasksBeingCompleted.has(taskIdStr)) {
    return;
  }
  tasksBeingCompleted.add(taskIdStr);

  try {
    const { completeTaskLogic } = await import("./taskController.js");
    const task = await Task.findById(taskId);

    if (!task || task.status !== "running") {
      return;
    }

    let completedTask;
    try {
      completedTask = await completeTaskLogic(taskId, io);
    } catch (err) {
      if (String(err?.message || "").includes("Task is not running")) {
        return;
      }
      throw err;
    }

    if (io) {
      // Run scheduler for new allocations and auto-cleanup
      await runSchedulerLogic(io, completedTask.roomId);

      // Cleanup idle auto-scaled servers
      await cleanupIdleAutoScaledServers(io, completedTask.roomId);
    }
  } catch (err) {
    console.error("Auto completion error:", err);
  } finally {
    tasksBeingCompleted.delete(taskIdStr);
  }
}

export async function pauseSchedulerForRoom(req, res) {
  try {
    const io = req.app && req.app.get("io");
    cancelAllScheduledForRoom(req.roomId);
    const pausedTasks = await pauseRunningTasksForRoom(io, req.roomId);
    res.json({ paused: pausedTasks.length, tasks: pausedTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function resumeSchedulerForRoom(req, res) {
  try {
    const io = req.app && req.app.get("io");
    const resumedTasks = await resumePausedTasksForRoom(io, req.roomId);
    if (io && resumedTasks.length > 0) {
      await runSchedulerLogic(io, req.roomId).catch(console.error);
    }
    res.json({ resumed: resumedTasks.length, tasks: resumedTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function rewindSchedulerForRoom(req, res) {
  try {
    const io = req.app && req.app.get("io");
    const task = await rewindLatestTaskForRoom(io, req.roomId);
    if (!task) {
      return res.status(404).json({ error: "No running task to rewind" });
    }
    res.json({ rewound: 1, task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function cleanupIdleAutoScaledServers(io, roomId) {
  try {
    const idleServers = await Server.find({
      roomId,
      isAutoScaled: true,
      usedRAM: 0,
    });

    for (const server of idleServers) {
      await Server.findByIdAndDelete(server._id);
      if (io) {
        io.to(roomId).emit("server:removed", { serverId: server._id });
      }
    }

    if (idleServers.length > 0) {
      console.log(
        `Cleaned up ${idleServers.length} idle auto-scaled servers for room ${roomId}`,
      );
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}
