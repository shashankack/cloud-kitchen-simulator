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
    setTasks((prev) => [task, ...prev]);
    return task;
  };

  const retryTaskForRoom = async (taskId) => {
    if (!roomId) return;
    const task = await retryTask(roomId, taskId);
    setTasks((prev) =>
      prev.map((item) => (item._id === task._id ? task : item)),
    );
    return task;
  };

  const retryAllFailedTasksForRoom = async () => {
    if (!roomId) return;
    const result = await retryAllFailedTasks(roomId);
    if (Array.isArray(result.tasks) && result.tasks.length > 0) {
      setTasks((prev) => {
        const byId = new Map(result.tasks.map((task) => [task._id, task]));
        return prev.map((item) => byId.get(item._id) || item);
      });
    }
    return result;
  };

  const addServer = async (payload) => {
    if (!roomId) return;
    const server = await createServer(roomId, payload);
    setServers((prev) => [server, ...prev]);
    return server;
  };

  const addAutoScaledServer = async (totalCPU = 16, totalRAM = 32) => {
    if (!roomId) return;
    const server = await createAutoScaledServer(roomId, totalCPU, totalRAM);
    setServers((prev) => [server, ...prev]);
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

  const initialize = async () => {
    try {
      setLoading(true);

      const [tasksData, logsData, serversData] = await Promise.all([
        getTasks(roomId),
        getTaskLogs(roomId),
        getServers(roomId),
      ]);

      setTasks(tasksData);
      setTaskLogs(Array.isArray(logsData) ? logsData : []);
      setServers(serversData);

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

      // Pending changes queue to batch frequent socket updates
      const pending = {
        fullTasks: null,
        updates: new Map(),
        fullServers: null,
        serverUpdates: new Map(),
      };
      let flushTimer = null;
      let lastFlushAt = 0;

      const scheduleFlush = (explicitDelay) => {
        if (flushTimer) return;

        // Adaptive delay: larger when there are many pending updates or when recent flush just ran
        const updatesCount = pending.updates.size + pending.serverUpdates.size;
        const now = Date.now();
        let delay = 80;
        if (typeof explicitDelay === "number") {
          delay = explicitDelay;
        } else {
          if (updatesCount > 200) delay = 350;
          else if (updatesCount > 80) delay = 220;
          else if (updatesCount > 30) delay = 140;
          else delay = 80;

          // if we flushed very recently, slightly increase to avoid rapid churn
          if (now - lastFlushAt < 200) delay += 60;
        }

        flushTimer = window.setTimeout(() => {
          flushTimer = null;
          lastFlushAt = Date.now();

          // apply full replacements first
          if (pending.fullTasks !== null) {
            setTasks(pending.fullTasks);
            pending.fullTasks = null;
            pending.updates.clear();
          } else if (pending.updates.size > 0) {
            setTasks((prev) => {
              const byId = new Map(prev.map((t) => [t._id, t]));
              for (const [id, task] of pending.updates) {
                byId.set(id, task);
              }
              const merged = Array.from(byId.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              return merged;
            });
            pending.updates.clear();
          }

          if (pending.fullServers !== null) {
            setServers(pending.fullServers);
            pending.fullServers = null;
            pending.serverUpdates.clear();
          } else if (pending.serverUpdates.size > 0) {
            setServers((prev) => {
              const byId = new Map(prev.map((s) => [s._id, s]));
              for (const [id, server] of pending.serverUpdates) {
                byId.set(id, server);
              }
              return Array.from(byId.values());
            });
            pending.serverUpdates.clear();
          }
        }, delay);
      };

      try {
        socket = await connectSocket(roomId);
      } catch (firstErr) {
        try {
          socket = await connectSocket(roomId);
        } catch (secondErr) {
          socket = {
            on: () => {},
            off: () => {},
            disconnect: () => {
              if (pollingInterval) window.clearInterval(pollingInterval);
            },
          };
          pollingInterval = window.setInterval(syncState, 500);
        }
      }

      const scheduleResync = () => {
        window.setTimeout(() => {
          syncState().catch(console.error);
        }, 120);
      };

      const handleTaskCreated = (task) => {
        // queue a creation as an update
        pending.updates.set(task._id, task);
        scheduleFlush();
      };

      const handleTasksSeeded = (docs) => {
        pending.fullTasks = docs;
        scheduleFlush(50);
      };
      const handleServerCreated = (server) => {
        pending.serverUpdates.set(server._id, server);
        scheduleFlush();
      };
      const handleServersSeeded = (docs) => {
        pending.fullServers = docs;
        scheduleFlush(50);
      };
      const handleTasksReset = () => { pending.fullTasks = []; scheduleFlush(); };
      const handleLogsReset = () => setTaskLogs([]);
      const handleServersReset = () => { pending.fullServers = []; scheduleFlush(); };
      const handleTaskUpdated = (updatedTask) => {
        pending.updates.set(updatedTask._id, updatedTask);
        scheduleFlush();
      };
      const handleServerUpdated = (updatedServer) => {
        pending.serverUpdates.set(updatedServer._id, updatedServer);
        scheduleFlush();
      };
      const handleServerRemoved = ({ serverId }) => {
        pending.serverUpdates.delete(serverId);
        // mark removal by setting fullServers null and applying a filter on next flush
        pending.fullServers = null;
        // apply immediate filter
        setServers((prev) => prev.filter((server) => server._id !== serverId));
      };
      const handleAutoScaledServersRemoved = ({ deletedCount } = {}) => {
        if ((deletedCount || 0) > 0) {
          setAutoScaledCleanupMessage(
            `Removed ${deletedCount} idle auto-scaled servers`,
          );
        }
        window.setTimeout(() => setAutoScaledCleanupMessage(null), 4000);
        getServers(roomId).then(setServers).catch(console.error);
      };
      const handleScheduleAllocations = () => {
        syncState().catch(console.error);
      };
      const handleInit = (data) => {
        if (data.tasks) { pending.fullTasks = data.tasks; }
        if (Array.isArray(data.logs)) setTaskLogs(data.logs);
        if (data.servers) { pending.fullServers = data.servers; }
        scheduleFlush(10);
      };
      const handleSocketConnect = () => {
        scheduleResync();
      };
      const handleSocketReconnect = () => {
        scheduleResync();
      };
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
      socket.on("schedule:allocations", handleScheduleAllocations);
      socket.on("init", handleInit);
      socket.on("log:created", handleLogCreated);
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
        socket.off("schedule:allocations", handleScheduleAllocations);
        socket.off("init", handleInit);
        socket.off("log:created", handleLogCreated);
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
      setTasks: () => {},
      setTaskLogs: () => {},
      setServers: () => {},
    };
  }

  return ctx;
}
