import { Navigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";

const ProtectedRoomsRoute = ({ children }) => {
  const { hasRoom, isInitializing } = useRoom();

  // Wait for localStorage to load
  if (isInitializing) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "90vh",
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ textAlign: "center" }}>
          <Box sx={{ maxWidth: "80vw" }}>
            <LinearProgress />
          </Box>
          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem" }}>
              Connecting to the backend
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                maxWidth: 420,
              }}
            >
              The API may take a few seconds to wake up on Render. Please wait
              while the room is being checked.
            </Typography>
          </Stack>
        </Stack>
      </Box>
    );
  }

  // If user has a room, redirect to simulator
  if (hasRoom) {
    return <Navigate to="/simulator" replace />;
  }

  return children;
};

export default ProtectedRoomsRoute;
