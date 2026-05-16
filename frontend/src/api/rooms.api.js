// src/api/rooms.api.js
import axiosClient from "./axiosClient";

export const createRoom = async (name) => {
  const res = await axiosClient.post("/rooms", { name });
  return res.data;
};

export const getRooms = async () => {
  const res = await axiosClient.get("/rooms");
  return res.data;
};

export const getRoom = async (roomId) => {
  const res = await axiosClient.get(`/rooms/${roomId}`);
  return res.data;
};

export const toggleAutoScaling = async (roomId) => {
  const res = await axiosClient.patch(`/rooms/${roomId}/auto-scaling`);
  return res.data;
};

export const toggleDeadlock = async (roomId) => {
  const res = await axiosClient.patch(`/rooms/${roomId}/deadlock`);
  return res.data;
};
