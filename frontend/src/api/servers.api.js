// src/api/servers.api.js
import axiosClient from "./axiosClient";

export const getServers = async (roomId) => {
  const res = await axiosClient.get("/servers", {
    params: { roomId },
  });
  return res.data;
};

export const createServer = async (roomId, payload) => {
  const res = await axiosClient.post("/servers", {
    ...payload,
    roomId,
  });
  return res.data;
};

export const createAutoScaledServer = async (roomId, totalCPU, totalRAM) => {
  const res = await axiosClient.post("/servers/auto-scale", {
    roomId,
    totalCPU,
    totalRAM,
  });
  return res.data;
};

export const removeServer = async (roomId, serverId) => {
  const res = await axiosClient.delete(`/servers/${serverId}`, {
    data: { roomId },
  });
  return res.data;
};

export const removeIdleAutoScaledServers = async (roomId) => {
  const res = await axiosClient.post("/servers/cleanup/idle", {
    roomId,
  });
  return res.data;
};

export const seedServers = async (roomId, count = 3) => {
  const res = await axiosClient.post("/servers/seed", {
    roomId,
    count,
  });
  return res.data;
};

export const resetServers = async (roomId) => {
  const res = await axiosClient.post("/servers/reset", {
    roomId,
  });
  return res.data;
};
