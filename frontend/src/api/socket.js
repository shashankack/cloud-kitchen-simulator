// src/api/socket.js
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

export const connectSocket = (roomId) => {
  return new Promise((resolve, reject) => {
    if (!roomId) {
      console.warn("connectSocket called without roomId");
      reject(new Error("roomId is required"));
      return;
    }

    // Disconnect existing socket if any
    if (socket) {
      console.log("Disconnecting existing socket");
      socket.disconnect();
      socket = null;
    }

    console.log("Creating new socket connection for roomId:", roomId);

    socket = io(API_URL, {
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
      reject(new Error("Socket connection timeout"));
    }, 5000);

    const onConnect = () => {
      console.log("✓ Socket connected:", socket.id, "for roomId:", roomId);
      clearTimeout(timeoutId);
      cleanup();
      resolve(socket);
    };

    const onError = (error) => {
      console.error("✗ Socket connection error:", error);
      clearTimeout(timeoutId);
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onError);

    socket.on("disconnect", (reason) => {
      console.log("✗ Socket disconnected. Reason:", reason);
    });

    // Debug: log all events
    socket.onAny((eventName, ...args) => {
      console.log(`📡 Socket event: ${eventName}`, args);
    });
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
