import Task from "../models/Task.js";
import Server from "../models/Server.js";

export const AUTO_SCALE_LIMITS = {
  minCPU: 16,
  minRAM: 32,
  maxCPU: 512,
  maxRAM: 1024,
};

// In-memory registry to track scheduled auto-completion timers
const scheduledCompletionTimers = new Map(); // taskId -> timeoutId
// FIX: Prevent race condition in task completion - track tasks currently being completed
const tasksBeingCompleted = new Set(); // taskId

export function scheduleAutoCompletion(taskId, io, delayMs) {
  // clear existing if present
  const existing = scheduledCompletionTimers.get(String(taskId));
  if (existing) {
    clearTimeout(existing);
  }

  const timeoutId = setTimeout(async () => {
    scheduledCompletionTimers.delete(String(taskId));
    try {
      await completeTaskAutomatically(taskId, io);
    } catch (err) {
      console.error("Error in scheduled completion:", err);
    }
  }, delayMs);

  scheduledCompletionTimers.set(String(taskId), timeoutId);
  return timeoutId;
}

export function cancelScheduledCompletion(taskId) {
  const key = String(taskId);
  const id = scheduledCompletionTimers.get(key);
  if (id) {
    clearTimeout(id);
    scheduledCompletionTimers.delete(key);
    return true;
  }
  return false;
}

export function cancelAllScheduledForRoom(roomId) {
  // best-effort: iterate keys and cancel timers for tasks that belong to room
  for (const [taskId, timeoutId] of scheduledCompletionTimers.entries()) {
    // We intentionally avoid an async DB lookup here to keep this fast;
    // callers that need room-scoped cancellation should fetch task ids first
    clearTimeout(timeoutId);
    scheduledCompletionTimers.delete(taskId);
  }
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

export async function triggerScheduler(req, res) {
  try {
    const allocations = await runSchedulerLogic(req.app.get("io"), req.roomId);
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

export async function runSchedulerLogic(io, roomId = null) {
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
    if ((server.usedCPU || 0) !== sumCPU || (server.usedRAM || 0) !== sumRAM) {
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

  // Create servers if demand exceeds available resources
  if (
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
        const newServer = new Server({
          roomId,
          name: `Server-${String.fromCharCode(65 + (servers.length % 26))}`,
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
    if (!safe) {
      continue; // unsafe, skip
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

    allocations.push({ taskId: task._id, serverId: chosen._id, task });
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

  await Promise.all(savePromises);

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
      scheduleAutoCompletion(taskData._id, io, timeMs);
    } catch (err) {
      console.error("Failed to schedule auto-completion:", err);
    }
  }

  return allocations;
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

    const completedTask = await completeTaskLogic(taskId, io);

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
