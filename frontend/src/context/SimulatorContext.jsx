import { createContext, useContext, useEffect, useMemo, useState } from "react";
import progressService from "../utils/progressService";
import { useRoom } from "./RoomContext";
import {
  getTasks,
  getTaskLogs,
  clearTaskLogs,
  seedTasks,
  resetTasks,
  retryTask,
  retryAllFailedTasks,
  createTask,
} from "../api/tasks.api";
import {
  getServers,
  seedServers,
  resetServers,
  createAutoScaledServer,
  removeIdleAutoScaledServers,
  createServer,
} from "../api/servers.api";
import { connectSocket, disconnectSocket } from "../api/socket";
import { triggerScheduler } from "../api/scheduler.api";
import { toggleAutoScaling, getRoom } from "../api/rooms.api";

const SimulatorContext = createContext(null);

export function SimulatorProvider({ children }) {
  const { roomId } = useRoom();

  const [tasks, setTasks] = useState([]);
  const [taskLogs, setTaskLogs] = useState([]);
  const [servers, setServers] = useState([]);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [autoScaledCleanupMessage, setAutoScaledCleanupMessage] =
    useState(null);
  const [autoScalingEnabled, setAutoScalingEnabled] = useState(true);
  const [deadlockEnabled, setDeadlockEnabled] = useState(false);
  const [lastAllocations, setLastAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncVisibilityState = async () => {
    if (!roomId) return;
    try {
      const [freshTasks, freshLogs, freshServers] = await Promise.all([
        getTasks(roomId),
        getTaskLogs(roomId),
        getServers(roomId),
      ]);
      setTasks(freshTasks);
      setTaskLogs(Array.isArray(freshLogs) ? freshLogs : []);
      setServers(freshServers);
    } catch (err) {
      console.error("Failed to resync simulator state:", err);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    let cleanup;
    let isMounted = true;
    let visibilityHandler = null;

    initialize()
      .then((cleanupFn) => {
        if (isMounted) cleanup = cleanupFn;
      })
      .catch((err) => {
        console.error("Failed to initialize simulator:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
        window.removeEventListener("focus", visibilityHandler);
      }
      if (cleanup) cleanup();
    };
  }, [roomId]);

  const addTask = async (payload) => {
    if (!roomId) return;
    const task = await createTask(roomId, payload);
    // Let the socket 'task:created' event update local state
    return task;
  };

  const retryTaskForRoom = async (taskId) => {
    if (!roomId) return;
    const task = await retryTask(roomId, taskId);
    // Socket will emit task:updated
    return task;
  };

  const retryAllFailedTasksForRoom = async () => {
    if (!roomId) return;
    const result = await retryAllFailedTasks(roomId);
    // Tasks will be updated via socket events
    return result;
  };

  const addServer = async (payload) => {
    if (!roomId) return;
    const server = await createServer(roomId, payload);
    // Server list will be refreshed via socket events
    return server;
  };

  const addAutoScaledServer = async (totalCPU = 16, totalRAM = 32) => {
    if (!roomId) return;
    const server = await createAutoScaledServer(roomId, totalCPU, totalRAM);
    return server;
  };

  const cleanupIdleAutoScaledServers = async () => {
    if (!roomId) return;
    const result = await removeIdleAutoScaledServers(roomId);
    const serversData = await getServers(roomId);
    setServers(serversData);
    if ((result?.deletedCount || 0) > 0) {
      setAutoScaledCleanupMessage(
        `Removed ${result.deletedCount} idle auto-scaled servers`,
      );
      window.setTimeout(() => setAutoScaledCleanupMessage(null), 4000);
    }
    return result;
  };

  const seedServersForRoom = async () => {
    if (!roomId) return;
    const docs = await seedServers(roomId);
    setServers(docs);
    return docs;
  };

  const seedServersForRoomCount = async (count = 3) => {
    if (!roomId) return;
    const docs = await seedServers(roomId, Number(count) || 3);
    setServers(docs);
    return docs;
  };

  const seedTasksForRoom = async (count = 6, intensity = "normal") => {
    if (!roomId) return;
    const docs = await seedTasks(roomId, count, intensity);
    setTasks(docs);
    return docs;
  };

  const resetTasksForRoom = async () => {
    if (!roomId) return;
    await resetTasks(roomId);
    setTasks([]);
    setTaskLogs([]);
  };

  const clearTaskLogsForRoom = async () => {
    if (!roomId) return;
    await clearTaskLogs(roomId);
    setTaskLogs([]);
  };

  const resetServersForRoom = async () => {
    if (!roomId) return;
    await resetServers(roomId);
    setServers([]);
  };

  const runScheduler = async () => {
    if (!roomId) return;
    return triggerScheduler(roomId);
  };

  const toggleAutoScalingForRoom = async () => {
    if (!roomId) return;
    try {
      const result = await toggleAutoScaling(roomId);
      setAutoScalingEnabled(result.autoScalingEnabled);
      return result;
    } catch (err) {
      console.error("Failed to toggle auto-scaling:", err);
    }
  };

  const toggleDeadlockForRoom = async () => {
    if (!roomId) return;
    try {
      const { toggleDeadlock } = await import("../api/rooms.api");
      const result = await toggleDeadlock(roomId);
      // backend responds with { allowUnsafeAllocation: boolean }
      setDeadlockEnabled(result.allowUnsafeAllocation);
      return result;
    } catch (err) {
      console.error("Failed to toggle deadlock mode:", err);
    }
  };

  const initialize = async () => {
    try {
      setLoading(true);

      const [tasksData, logsData, serversData, roomData] = await Promise.all([
        getTasks(roomId),
        getTaskLogs(roomId),
        getServers(roomId),
        getRoom(roomId),
      ]);

      setTasks(tasksData);
      setTaskLogs(Array.isArray(logsData) ? logsData : []);
      setServers(serversData);
      if (roomData && typeof roomData.autoScalingEnabled === "boolean") {
        setAutoScalingEnabled(roomData.autoScalingEnabled);
      }
      if (roomData && typeof roomData.allowUnsafeAllocation === "boolean") {
        setDeadlockEnabled(roomData.allowUnsafeAllocation);
      }

      let socket;
      let pollingInterval = null;

      const syncState = async () => {
        const [freshTasks, freshLogs, freshServers] = await Promise.all([
          getTasks(roomId),
          getTaskLogs(roomId),
          getServers(roomId),
        ]);
        setTasks(freshTasks);
        setTaskLogs(Array.isArray(freshLogs) ? freshLogs : []);
        setServers(freshServers);
      };

      // Direct socket-driven state updates (no batching)
      try {
        socket = await connectSocket(roomId);
      } catch (firstErr) {
        try {
          socket = await connectSocket(roomId);
        } catch (secondErr) {
          socket = { on: () => {}, off: () => {}, disconnect: () => { if (pollingInterval) window.clearInterval(pollingInterval); } };
          pollingInterval = window.setInterval(syncState, 500);
        }
      }

      const scheduleResync = () => {
        window.setTimeout(() => {
          syncState().catch(console.error);
        }, 120);
      };

      const handleTaskCreated = (task) => {
        setTasks((prev) => [task, ...prev]);
      };

      const handleTasksSeeded = (docs) => {
        setTasks(docs || []);
      };

      const handleServerCreated = (server) => {
        if (!server || !server._id) return;
        setServers((prev) => {
          const byId = new Map(prev.map((s) => [s._id, s]));
          byId.set(server._id, server);
          return Array.from(byId.values());
        });
      };

      const handleServersSeeded = (docs) => {
        setServers(docs || []);
      };

      const handleTasksReset = () => setTasks([]);
      const handleLogsReset = () => setTaskLogs([]);
      const handleServersReset = () => setServers([]);

      const handleTaskUpdated = (updatedTask) => {
        setTasks((prev) => {
          const byId = new Map(prev.map((t) => [t._id, t]));
          byId.set(updatedTask._id, updatedTask);
          return Array.from(byId.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
      };

      const handleServerUpdated = (updatedServer) => {
        setServers((prev) => {
          const byId = new Map(prev.map((s) => [s._id, s]));
          byId.set(updatedServer._id, updatedServer);
          return Array.from(byId.values());
        });
      };

      const handleServerRemoved = ({ serverId }) => {
        setServers((prev) => prev.filter((server) => server._id !== serverId));
      };

      const handleAutoScaledServersRemoved = ({ deletedCount } = {}) => {
        if ((deletedCount || 0) > 0) {
          setAutoScaledCleanupMessage(`Removed ${deletedCount} idle auto-scaled servers`);
          window.setTimeout(() => setAutoScaledCleanupMessage(null), 4000);
        }
        getServers(roomId).then(setServers).catch(console.error);
      };

      const handleScheduleAllocations = () => {
        return syncState().catch(console.error);
      };

      const handleScheduleAllocationsWithData = (payload) => {
        try {
          if (payload && Array.isArray(payload.allocations)) {
            const stamped = (payload.allocations || []).map((a) => ({ ...a, ts: Date.now() }));
            setLastAllocations(stamped);
          }
        } catch (e) {
          /* ignore */
        }
        syncState().catch(console.error);
      };

      const handleInit = (data) => {
        if (data.tasks) setTasks(data.tasks || []);
        if (Array.isArray(data.logs)) setTaskLogs(data.logs || []);
        if (data.servers) setServers(data.servers || []);
      };

      const handleSocketConnect = () => scheduleResync();
      const handleSocketReconnect = () => scheduleResync();

      const handleLogCreated = (log) => {
        if (!log || !log._id) return;
        setTaskLogs((prev) => {
          const exists = prev.some((item) => item._id === log._id);
          if (exists) return prev;
          return [log, ...prev].slice(0, 100);
        });
      };

      const handleSeedProgress = (payload) => {
        try {
          if (!payload) return;
          const { stage, value } = payload;
          if (stage === "start") progressService.start(Number(value) || 0);
          else if (stage === "update") progressService.update(Number(value) || 0);
          else if (stage === "finish") progressService.finish();
        } catch (e) {
          /* ignore */
        }
      };

      const handleRoomUpdated = (data) => {
        if (data && typeof data.autoScalingEnabled === "boolean") {
          setAutoScalingEnabled(data.autoScalingEnabled);
        }
        if (data && typeof data.allowUnsafeAllocation === "boolean") {
          setDeadlockEnabled(data.allowUnsafeAllocation);
        }
      };

      socket.on("task:created", handleTaskCreated);
      socket.on("tasks:seeded", handleTasksSeeded);
      socket.on("seed:progress", handleSeedProgress);
      socket.on("server:created", handleServerCreated);
      socket.on("servers:seeded", handleServersSeeded);
      socket.on("tasks:reset", handleTasksReset);
      socket.on("logs:reset", handleLogsReset);
      socket.on("servers:reset", handleServersReset);
      socket.on("task:updated", handleTaskUpdated);
      socket.on("server:updated", handleServerUpdated);
      socket.on("server:removed", handleServerRemoved);
      socket.on("autoScaledServers:removed", handleAutoScaledServersRemoved);
      socket.on("schedule:allocations", handleScheduleAllocationsWithData);
      socket.on("init", handleInit);
      socket.on("log:created", handleLogCreated);
      socket.on("room:updated", handleRoomUpdated);
      socket.on("connect", handleSocketConnect);
      socket.on("reconnect", handleSocketReconnect);

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          scheduleResync();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleVisibilityChange);

      return () => {
        socket.off("task:created", handleTaskCreated);
        socket.off("tasks:seeded", handleTasksSeeded);
          socket.off("seed:progress", handleSeedProgress);
        socket.off("server:created", handleServerCreated);
        socket.off("servers:seeded", handleServersSeeded);
        socket.off("tasks:reset", handleTasksReset);
        socket.off("logs:reset", handleLogsReset);
        socket.off("servers:reset", handleServersReset);
        socket.off("task:updated", handleTaskUpdated);
        socket.off("server:updated", handleServerUpdated);
        socket.off("server:removed", handleServerRemoved);
        socket.off("autoScaledServers:removed", handleAutoScaledServersRemoved);
        socket.off("schedule:allocations", handleScheduleAllocationsWithData);
        socket.off("init", handleInit);
        socket.off("log:created", handleLogCreated);
        socket.off("room:updated", handleRoomUpdated);
        socket.off("connect", handleSocketConnect);
        socket.off("reconnect", handleSocketReconnect);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleVisibilityChange);
        if (pollingInterval) window.clearInterval(pollingInterval);
        disconnectSocket();
      };
    } catch (err) {
      console.error("Initialize error:", err);
      return () => {};
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = progressService.subscribe((state) => {
      if (!state || !state.type) return;
      if (state.type === "start") {
        setGlobalLoading(true);
        setGlobalProgress(Number(state.value) || 0);
      } else if (state.type === "update") {
        setGlobalProgress(Math.max(0, Math.min(100, Number(state.value) || 0)));
      } else if (state.type === "finish") {
        setGlobalProgress(0);
        setGlobalLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      taskLogs,
      servers,
      loading,
      globalProgress,
      globalLoading,
      autoScaledCleanupMessage,
      startGlobalProgress: (initial = 0) => {
        setGlobalLoading(true);
        setGlobalProgress(initial);
      },
      updateGlobalProgress: (value) => {
        setGlobalProgress(Math.max(0, Math.min(100, Number(value) || 0)));
      },
      finishGlobalProgress: () => {
        setGlobalProgress(0);
        setGlobalLoading(false);
      },
      addTask,
      retryTaskForRoom,
      retryAllFailedTasksForRoom,
      addServer,
      addAutoScaledServer,
      cleanupIdleAutoScaledServers,
      seedServersForRoom,
      seedServersForRoomCount,
      seedTasksForRoom,
      resetTasksForRoom,
      clearTaskLogsForRoom,
      resetServersForRoom,
      runScheduler,
      toggleAutoScalingForRoom,
      toggleDeadlockForRoom,
      autoScalingEnabled,
      deadlockEnabled,
      lastAllocations,
      setTasks,
      setTaskLogs,
      setServers,
    }),
    [
      tasks,
      taskLogs,
      servers,
      loading,
      globalProgress,
      globalLoading,
      autoScaledCleanupMessage,
      autoScalingEnabled,
      deadlockEnabled,
      lastAllocations,
    ],
  );

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const ctx = useContext(SimulatorContext);
  if (ctx === null) {
    return {
      tasks: [],
      taskLogs: [],
      servers: [],
      loading: false,
      globalProgress: 0,
      globalLoading: false,
      autoScaledCleanupMessage: null,
      startGlobalProgress: () => {},
      updateGlobalProgress: () => {},
      finishGlobalProgress: () => {},
      addTask: async () => {},
      retryTaskForRoom: async () => {},
      retryAllFailedTasksForRoom: async () => {},
      addServer: async () => {},
      addAutoScaledServer: async () => {},
      cleanupIdleAutoScaledServers: async () => {},
      seedServersForRoom: async () => {},
      seedServersForRoomCount: async () => {},
      seedTasksForRoom: async () => {},
      resetTasksForRoom: async () => {},
      clearTaskLogsForRoom: async () => {},
      resetServersForRoom: async () => {},
      runScheduler: async () => {},
      toggleAutoScalingForRoom: async () => {},
      toggleDeadlockForRoom: async () => {},
      autoScalingEnabled: true,
      deadlockEnabled: false,
      lastAllocations: [],
      setTasks: () => {},
      setTaskLogs: () => {},
      setServers: () => {},
    };
  }

  return ctx;
}
