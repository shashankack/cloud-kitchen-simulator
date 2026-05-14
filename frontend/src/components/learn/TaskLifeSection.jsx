import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

import { useViewMode } from "../../context/ViewModeContext";

const lifecycle = [
  {
    icon: <PendingActionsRoundedIcon />,
    status: "Waiting",
    kitchenStatus: "Queued",
    detail: "The task exists but has not been assigned yet.",
    kitchenDetail:
      "The order is received but no chef station has started it yet.",
  },
  {
    icon: <PlayCircleRoundedIcon />,
    status: "Running",
    kitchenStatus: "Preparing",
    detail:
      "The task has been allocated to a server and is consuming resources.",
    kitchenDetail:
      "The order is assigned to a chef station and is using capacity and ingredients.",
  },
  {
    icon: <CheckCircleRoundedIcon />,
    status: "Completed",
    kitchenStatus: "Completed",
    detail: "The task finishes successfully and resources are released.",
    kitchenDetail:
      "The order is finished and the station becomes available again.",
  },
  {
    icon: <ErrorRoundedIcon />,
    status: "Failed",
    kitchenStatus: "Failed",
    detail: "The task fails during execution and stores a failure reason.",
    kitchenDetail: "The order fails during preparation and stores a reason.",
  },
  {
    icon: <ReplayRoundedIcon />,
    status: "Retry",
    kitchenStatus: "Retry",
    detail: "Failed work can be moved back to waiting and scheduled again.",
    kitchenDetail:
      "A failed order can be sent back into the queue and prepared again.",
  },
];

function TaskLifeSection() {
  const { isKitchen } = useViewMode();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<TimelineRoundedIcon />}
            label={isKitchen ? "Order Lifecycle" : "Task Lifecycle"}
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
              ? "How an order moves through the kitchen"
              : "How a task moves through the system"}
          </Typography>

          <Typography
            sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 900 }}
          >
            {isKitchen
              ? "Every order moves through clear states: queued, preparing, completed, failed, or retried. These states help the simulator show exactly what the kitchen manager is doing."
              : "Every task moves through clear states: waiting, running, completed, failed, or retried. These states make the scheduler behavior visible and debuggable."}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {lifecycle.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item.status}>
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

                  <Typography variant="h6">
                    {isKitchen ? item.kitchenStatus : item.status}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.65,
                      fontSize: "0.92rem",
                    }}
                  >
                    {isKitchen ? item.kitchenDetail : item.detail}
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
            Why lifecycle tracking matters
          </Typography>
          <Typography
            sx={{ color: "text.secondary", mt: 0.8, lineHeight: 1.75 }}
          >
            Lifecycle tracking allows the simulator to calculate resource usage,
            release capacity after completion, show failure reasons, retry
            failed work, and keep the realtime UI in sync.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default TaskLifeSection;
