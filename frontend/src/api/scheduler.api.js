// src/api/scheduler.api.js
import axiosClient from "./axiosClient";

export const triggerScheduler = async (roomId) => {
  const res = await axiosClient.post("/schedule/trigger", {
    roomId,
  });
  return res.data;
};

export const stepScheduler = async (roomId) => {
  const res = await axiosClient.post("/schedule/trigger", {
    roomId,
    step: true,
  });
  return res.data;
};
