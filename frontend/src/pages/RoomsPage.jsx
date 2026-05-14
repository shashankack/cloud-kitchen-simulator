import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import { useViewMode } from "../context/ViewModeContext";

import { createRoom, getRoom, getRooms } from "../api/rooms.api";

function RoomsPage() {
  const { setRoom } = useRoom();
  const { isKitchen } = useViewMode();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  const loadRooms = async () => {
    try {
      setRoomsLoading(true);
      setRoomsError("");

      const data = await getRooms();

      if (Array.isArray(data)) {
        setRooms(data);
      } else if (Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      } else {
        console.error("Invalid rooms response:", data);
        setRooms([]);
      }
    } catch (err) {
      console.error(err);
      setRoomsError("Could not load rooms.");
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    try {
      setLoading(true);
      const room = await createRoom(roomName.trim());
      setRoom(room);
      await loadRooms();
      navigate("/simulator");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) return;

    try {
      setLoading(true);

      const room = await getRoom(joinRoomId.trim());

      setRoom(room);

      navigate("/simulator");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRoom = (room) => {
    setRoom(room);
    navigate("/simulator");
  };
  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 6, md: 3 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "3rem", md: "3.5rem" },
              maxWidth: 950,
            }}
          >
            {isKitchen
              ? "Create or join a kitchen room."
              : "Create or join a simulation room."}
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 720,
              lineHeight: 1.8,
              fontSize: { xs: "1rem", md: "1.12rem" },
            }}
          >
            {isKitchen
              ? "Kitchen rooms keep orders, chefs, and live allocation activity grouped into one shared simulation."
              : "Simulation rooms keep tasks, servers, and live scheduling activity grouped into one shared environment."}
          </Typography>
        </Stack>

        <Grid container spacing={3} alignItems="stretch">
          {/* LEFT: Available Rooms */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                height: "100%",
                p: { xs: 3, md: 4 },
                borderRadius: "32px",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Typography variant="h4">
                  {isKitchen
                    ? "Available Kitchen Rooms"
                    : "Available Simulation Rooms"}
                </Typography>

                <Typography sx={{ color: "text.secondary" }}>
                  {isKitchen
                    ? "Pick an existing kitchen room and continue the order flow."
                    : "Pick an existing simulation room and continue scheduling tasks."}
                </Typography>
              </Stack>

              <Stack
                spacing={2}
                sx={{
                  p: 1,
                  overflowY: "scroll",
                  height: 460,
                  "&::-webkit-scrollbar": {
                    display: "none",
                  },
                }}
              >
                {roomsLoading ? (
                  <Typography sx={{ color: "text.secondary", p: 2 }}>
                    Loading rooms...
                  </Typography>
                ) : roomsError ? (
                  <Typography sx={{ color: "error.main", p: 2 }}>
                    {roomsError}
                  </Typography>
                ) : rooms.length === 0 ? (
                  <Typography sx={{ color: "text.secondary", p: 2 }}>
                    No rooms available yet. Create one to start.
                  </Typography>
                ) : (
                  rooms.map((room) => (
                    <Box
                      key={room.roomId}
                      sx={{
                        p: 2.5,
                        borderRadius: "22px",
                        background: "rgba(255,255,255,0.035)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        transition:
                          "transform 180ms ease, border-color 180ms ease, background 180ms ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          borderColor: "rgba(76,201,240,0.24)",
                          background: "rgba(255,255,255,0.05)",
                        },
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        sx={{
                          justifyContent: "space-between",
                          alignItems: { xs: "flex-start", sm: "center" },
                        }}
                      >
                        <Box>
                          <Typography variant="h6">{room.name}</Typography>

                          <Typography
                            sx={{
                              color: "text.secondary",
                              mt: 0.5,
                              fontSize: "0.88rem",
                            }}
                          >
                            {room.roomId}
                          </Typography>

                          <Typography
                            sx={{
                              color: "text.disabled",
                              mt: 0.8,
                              fontSize: "0.82rem",
                            }}
                          >
                            Created room
                          </Typography>
                        </Box>

                        <Button
                          variant="outlined"
                          onClick={() => handleEnterRoom(room)}
                        >
                          {isKitchen ? "Enter Kitchen" : "Enter Room"}
                        </Button>
                      </Stack>
                    </Box>
                  ))
                )}
              </Stack>
            </Box>
          </Grid>

          {/* RIGHT: Create / Join */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3} sx={{ height: "100%" }}>
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "32px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h4">
                      {isKitchen
                        ? "Create Kitchen Room"
                        : "Create Simulation Room"}
                    </Typography>

                    <Typography sx={{ color: "text.secondary", mt: 1 }}>
                      {isKitchen
                        ? "Start a new kitchen environment for order allocation."
                        : "Start a new isolated environment for task scheduling."}
                    </Typography>
                  </Box>

                  <TextField
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    label={isKitchen ? "Kitchen Room Name" : "Room Name"}
                    placeholder={
                      isKitchen ? "Dinner Rush Simulation" : "Alpha Simulation"
                    }
                    fullWidth
                  />

                  <Button
                    variant="contained"
                    onClick={handleCreateRoom}
                    disabled={loading}
                    size="large"
                    startIcon={<AddRoundedIcon />}
                  >
                    {isKitchen
                      ? "Create Kitchen Room"
                      : "Create Simulation Room"}
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "32px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h4">
                      {isKitchen ? "Join Kitchen Room" : "Join Simulation Room"}
                    </Typography>

                    <Typography sx={{ color: "text.secondary", mt: 1 }}>
                      {isKitchen
                        ? "Enter an existing kitchen room and continue the live order flow."
                        : "Enter an existing room and continue the live simulation."}
                    </Typography>
                  </Box>

                  <TextField
                    label="Room ID"
                    placeholder="room-abc123"
                    fullWidth
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                  />

                  <Button
                    variant="outlined"
                    onClick={handleJoinRoom}
                    disabled={loading}
                    size="large"
                    startIcon={<LoginRoundedIcon />}
                  >
                    {isKitchen ? "Join Kitchen Room" : "Join Simulation Room"}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default RoomsPage;
