import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import HubRoundedIcon from "@mui/icons-material/HubRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";

import { useViewMode } from "../../context/ViewModeContext";

const architectureLayers = [
  {
    icon: <WebRoundedIcon />,
    title: "Frontend",
    detail:
      "React renders the simulator, controls the view mode, displays task state, and listens for realtime updates.",
  },
  {
    icon: <DnsRoundedIcon />,
    title: "Backend API",
    detail:
      "Express handles room creation, task creation, server actions, retries, resets, and scheduling decisions.",
  },
  {
    icon: <StorageRoundedIcon />,
    title: "Database",
    detail:
      "MongoDB stores rooms, tasks, servers, resource usage, lifecycle status, and failure reasons.",
  },
  {
    icon: <SensorsRoundedIcon />,
    title: "Realtime Layer",
    detail:
      "Socket.io pushes room-scoped updates so users inside the same room see the same simulation state.",
  },
  {
    icon: <MeetingRoomRoundedIcon />,
    title: "Room Isolation",
    detail:
      "Every simulation belongs to a room. Actions in one room should never affect another room.",
  },
  {
    icon: <AccountTreeRoundedIcon />,
    title: "Scheduling Engine",
    detail:
      "The scheduler checks priority, resources, and safe-state logic before assigning work to servers.",
  },
];

function ArchitectureConceptsSection() {
  const { isKitchen } = useViewMode();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at bottom left, rgba(34,197,94,0.13), transparent 34%), rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<HubRoundedIcon />}
            label="System Architecture"
            sx={{
              width: "fit-content",
              color: "#86efac",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.22)",
              fontWeight: 800,
            }}
          />

          <Typography variant="h3">
            {isKitchen
              ? "The kitchen is actually a distributed system"
              : "The simulator is a small distributed system"}
          </Typography>

          <Typography
            sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 960 }}
          >
            {isKitchen
              ? "Behind the kitchen analogy, the app is teaching how modern systems coordinate shared state across frontend screens, backend logic, database records, and realtime room updates."
              : "The simulator is not just a visual graph. It connects frontend state, backend scheduling logic, database persistence, socket events, and room isolation into one working system."}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {architectureLayers.map((layer) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={layer.title}>
              <Box
                sx={{
                  height: "100%",
                  p: 2.3,
                  borderRadius: "24px",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Stack spacing={1.4}>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: "16px",
                      display: "grid",
                      placeItems: "center",
                      color: "#86efac",
                      background: "rgba(34,197,94,0.1)",
                    }}
                  >
                    {layer.icon}
                  </Box>

                  <Typography variant="h6">{layer.title}</Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.65,
                      fontSize: "0.92rem",
                    }}
                  >
                    {layer.detail}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            p: 2.5,
            borderRadius: "24px",
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Typography sx={{ fontWeight: 900 }}>
            Why this matters
          </Typography>

          <Typography sx={{ color: "text.secondary", mt: 0.8, lineHeight: 1.75 }}>
            A real system is not one piece of code. It is many layers agreeing
            on the same truth. The frontend shows state, the backend decides
            state, the database stores state, and sockets broadcast state.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default ArchitectureConceptsSection;