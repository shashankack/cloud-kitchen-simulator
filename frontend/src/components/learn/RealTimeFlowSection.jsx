import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import ApiRoundedIcon from "@mui/icons-material/ApiRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import CachedRoundedIcon from "@mui/icons-material/CachedRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";

import { useViewMode } from "../../context/ViewModeContext";

const flow = [
  {
    icon: <DesktopWindowsRoundedIcon />,
    title: "User action",
    detail:
      "The user creates a task, adds a server, retries work, or runs the scheduler.",
  },
  {
    icon: <ApiRoundedIcon />,
    title: "REST API request",
    detail:
      "The frontend sends the action to the backend with the current roomId.",
  },
  {
    icon: <StorageRoundedIcon />,
    title: "Database update",
    detail:
      "MongoDB stores updated tasks, servers, room data, and lifecycle logs.",
  },
  {
    icon: <SensorsRoundedIcon />,
    title: "Socket event",
    detail:
      "Socket.io emits room-scoped updates only to clients inside that simulation room.",
  },
  {
    icon: <CachedRoundedIcon />,
    title: "Polling fallback",
    detail:
      "If sockets disconnect, the frontend polls the backend to stay near-realtime.",
  },
];

function RealtimeFlowSection() {
  const { isKitchen } = useViewMode();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at bottom left, rgba(168,85,247,0.13), transparent 34%), rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<SyncRoundedIcon />}
            label="Realtime Synchronization"
            sx={{
              width: "fit-content",
              color: "primary.main",
              background: "rgba(76,201,240,0.1)",
              border: "1px solid rgba(76,201,240,0.22)",
              fontWeight: 800,
            }}
          />

          <Typography variant="h3">
            {isKitchen
              ? "How every kitchen screen stays updated"
              : "How every simulator client stays updated"}
          </Typography>

          <Typography
            sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 920 }}
          >
            {isKitchen
              ? "When one user creates an order or adds a chef station, every client in the same kitchen room receives the update. Other rooms do not receive it."
              : "When one user creates a task or adds a server, every client in the same simulation room receives the update. Other rooms do not receive it."}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {flow.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item.title}>
              <Box
                sx={{
                  height: "100%",
                  p: 2.2,
                  borderRadius: "24px",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Stack spacing={1.4}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "16px",
                      display: "grid",
                      placeItems: "center",
                      color: "primary.main",
                      background: "rgba(76,201,240,0.1)",
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography sx={{ color: "primary.main", fontWeight: 900 }}>
                    0{index + 1}
                  </Typography>

                  <Typography variant="h6">{item.title}</Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.65,
                      fontSize: "0.92rem",
                    }}
                  >
                    {item.detail}
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
            background: "rgba(76,201,240,0.08)",
            border: "1px solid rgba(76,201,240,0.18)",
          }}
        >
          <Typography sx={{ fontWeight: 900 }}>Key lesson</Typography>
          <Typography
            sx={{ color: "text.secondary", mt: 0.8, lineHeight: 1.75 }}
          >
            Realtime systems need two layers: a direct request path for commands
            and a broadcast path for updates. This app uses REST for actions and
            Socket.io for live synchronization.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default RealtimeFlowSection;
