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
