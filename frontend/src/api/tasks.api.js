// src/api/tasks.api.js
import axiosClient from "./axiosClient";

export const getTasks = async (roomId) => {
  const res = await axiosClient.get("/tasks", {
    params: { roomId },
  });
  return res.data;
};

export const getTaskLogs = async (roomId) => {
  const res = await axiosClient.get("/tasks/logs", {
    params: { roomId },
  });
  return res.data;
};

export const clearTaskLogs = async (roomId) => {
  const res = await axiosClient.delete("/tasks/logs", {
    params: { roomId },
  });
  return res.data;
};

export const createTask = async (roomId, payload) => {
  const res = await axiosClient.post("/tasks", {
    ...payload,
    roomId,
  });
  return res.data;
};

export const completeTask = async (roomId, taskId) => {
  const res = await axiosClient.post(`/tasks/${taskId}/complete`, {
    roomId,
  });
  return res.data;
};

export const retryTask = async (roomId, taskId) => {
  const res = await axiosClient.post(`/tasks/${taskId}/retry`, {
    roomId,
  });
  return res.data;
};

export const retryAllFailedTasks = async (roomId) => {
  const res = await axiosClient.post(`/tasks/retry-all-failed`, {
    roomId,
  });
  return res.data;
};

export const seedTasks = async (roomId, count = 6, intensity = "normal") => {
  const res = await axiosClient.post(`/tasks/seed`, {
    roomId,
    count,
    intensity,
  });
  return res.data;
};

export const resetTasks = async (roomId) => {
  const res = await axiosClient.post(`/tasks/reset`, {
    roomId,
  });
  return res.data;
};
