import { createContext, useContext, useEffect, useState } from "react";
import { getRoom } from "../api/rooms.api";

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const [room, setRoomState] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sim-room");

    const hydrateRoom = async () => {
      if (!stored) {
        setIsInitializing(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed.roomId !== "string" || typeof parsed.name !== "string") {
          localStorage.removeItem("sim-room");
          setRoomState(null);
          setIsInitializing(false);
          return;
        }

        await getRoom(parsed.roomId);
        setRoomState(parsed);
      } catch (err) {
        console.error("Stored room failed validation:", err);
        localStorage.removeItem("sim-room");
        setRoomState(null);
      } finally {
        setIsInitializing(false);
      }
    };

    hydrateRoom();
  }, []);

  const setRoom = (data) => {
    setRoomState(data);
    localStorage.setItem("sim-room", JSON.stringify(data));
  };

  const clearRoom = () => {
    setRoomState(null);
    localStorage.removeItem("sim-room");
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        roomId: room?.roomId || null,
        roomName: room?.name || null,
        hasRoom: !!room,
        isInitializing,
        setRoom,
        clearRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  return useContext(RoomContext);
}
