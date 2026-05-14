import { Navigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";
import { Box, CircularProgress } from "@mui/material";

const ProtectedSimulatorRoute = ({ children }) => {
  const { hasRoom, isInitializing } = useRoom();

  // Wait for localStorage to load
  if (isInitializing) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!hasRoom) {
    return <Navigate to="/rooms" replace />;
  }
  return children;
};

export default ProtectedSimulatorRoute;
