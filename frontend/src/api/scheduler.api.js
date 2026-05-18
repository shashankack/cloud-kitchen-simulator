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

export const pauseScheduler = async (roomId) => {
  const res = await axiosClient.post("/schedule/pause", {
    roomId,
  });
  return res.data;
};

export const resumeScheduler = async (roomId) => {
  const res = await axiosClient.post("/schedule/resume", {
    roomId,
  });
  return res.data;
};

export const rewindScheduler = async (roomId) => {
  const res = await axiosClient.post("/schedule/rewind", {
    roomId,
  });
  return res.data;
};
