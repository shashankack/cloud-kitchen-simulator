import { io } from "socket.io-client";
import { logInfo, logError, logWarn } from "../utils/logger";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socketInstance = null;
let socketPromise = null;
let activeRoomId = null;

export const connectSocket = (roomId) => {
  if (!roomId) return Promise.reject(new Error("roomId is required"));

  // Reuse an already-connected socket for the same room
  if (socketInstance && activeRoomId === roomId && socketInstance.connected) {
    logInfo("Reusing existing socket for room", { roomId, id: socketInstance.id });
    return Promise.resolve(socketInstance);
  }

  // If a connection is in-flight for the same room, return the in-flight promise
  if (socketPromise && activeRoomId === roomId) {
    return socketPromise;
  }

  // Otherwise create a new connection promise
  activeRoomId = roomId;
  socketPromise = new Promise((resolve, reject) => {
    try {
      const s = io(API_URL, {
        query: { roomId },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 300,
        reconnectionDelayMax: 2000,
        reconnectionAttempts: 5,
        upgrade: true,
        forceNew: false,
      });

      const timeoutId = setTimeout(() => {
        cleanup();
        const err = new Error("Socket connection timeout");
        logError("Socket timeout", err);
        reject(err);
      }, 5000);

      const onConnect = () => {
        clearTimeout(timeoutId);
        cleanup();
        socketInstance = s;
        logInfo("Socket connected", { id: s.id, roomId });
        resolve(s);
      };

      const onError = (err) => {
        clearTimeout(timeoutId);
        cleanup();
        logError("Socket connection error", err);
        reject(err);
      };

      const cleanup = () => {
        s.off("connect", onConnect);
        s.off("connect_error", onError);
      };

      s.on("connect", onConnect);
      s.on("connect_error", onError);

      s.on("disconnect", (reason) => {
        logWarn("Socket disconnected", { reason, roomId });
      });

      // optional debug output in dev
      if (import.meta.env.DEV) {
        s.onAny((eventName, ...args) => {
          // eslint-disable-next-line no-console
          console.debug("socket.event", eventName, args);
        });
      }
    } catch (err) {
      socketPromise = null;
      logError("Failed to initialize socket", err);
      reject(err);
    }
  }).finally(() => {
    // clear in-flight promise after settle so subsequent calls create fresh promises
    socketPromise = null;
  });

  return socketPromise;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    try {
      socketInstance.disconnect();
    } catch (e) {
      logWarn("Error disconnecting socket", e);
    }
    socketInstance = null;
    activeRoomId = null;
    socketPromise = null;
  }
};

export const getSocket = () => socketInstance;
