import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import TimerOffRoundedIcon from "@mui/icons-material/TimerOffRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import { useViewMode } from "../../context/ViewModeContext";

const failureFlow = [
  {
    icon: <ErrorRoundedIcon />,
    title: "Task fails",
    kitchenTitle: "Order fails",
    detail: "A running task can fail before completion.",
    kitchenDetail: "An order can fail while being prepared.",
  },
  {
    icon: <ReportProblemRoundedIcon />,
    title: "Reason is stored",
    kitchenTitle: "Reason is stored",
    detail:
      "The backend saves a failureReason so the UI can explain what happened.",
    kitchenDetail:
      "The kitchen stores why the order failed so the user can understand it.",
  },
  {
    icon: <TimerOffRoundedIcon />,
    title: "Timer is cancelled",
    kitchenTitle: "Timer is cancelled",
    detail:
      "The scheduled completion timer is cleared so stale completions cannot fire later.",
    kitchenDetail:
      "The old preparation timer is cleared so the failed order does not complete by mistake.",
  },
  {
    icon: <MemoryRoundedIcon />,
    title: "Resources are recalculated",
    kitchenTitle: "Capacity is recalculated",
    detail: "CPU and RAM usage are recomputed after failure or retry.",
    kitchenDetail:
      "Cooking capacity and ingredients are recalculated after failure or retry.",
  },
  {
    icon: <ReplayRoundedIcon />,
    title: "Retry returns to queue",
    kitchenTitle: "Retry returns to queue",
    detail: "A failed task can be moved back to waiting and scheduled again.",
    kitchenDetail:
      "A failed order can be moved back into the queue and prepared again.",
  },
];

function FailureSimulationSection() {
  const { isKitchen } = useViewMode();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at top left, rgba(239,68,68,0.13), transparent 34%), rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<ReportProblemRoundedIcon />}
            label={isKitchen ? "Failure & Retry Flow" : "Failure Simulation"}
            sx={{
              width: "fit-content",
              color: "#fca5a5",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.22)",
              fontWeight: 800,
            }}
          />

          <Typography variant="h3">
            {isKitchen
              ? "How the kitchen handles failed orders"
              : "How the simulator handles failed tasks"}
          </Typography>

          <Typography
            sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 920 }}
          >
            {isKitchen
              ? "Real kitchens do not only complete orders. Orders can fail because capacity runs out, ingredients are unavailable, or preparation breaks. The simulator models that failure path instead of pretending every order succeeds."
              : "Real distributed systems do not only complete tasks. Tasks can fail because of server errors, timeouts, resource issues, or execution problems. The simulator models that failure path so retry behavior becomes visible."}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {failureFlow.map((item, index) => (
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
                      color: "#fca5a5",
                      background: "rgba(239,68,68,0.1)",
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography sx={{ color: "#fca5a5", fontWeight: 900 }}>
                    0{index + 1}
                  </Typography>

                  <Typography variant="h6">
                    {isKitchen ? item.kitchenTitle : item.title}
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
          <Stack direction="row" spacing={1.2} alignItems="center">
            <RestartAltRoundedIcon sx={{ color: "primary.main" }} />
            <Typography sx={{ fontWeight: 900 }}>
              Why retry is not just “run it again”
            </Typography>
          </Stack>

          <Typography sx={{ color: "text.secondary", mt: 1, lineHeight: 1.75 }}>
            Retrying safely means resetting the task state, cancelling old
            timers, recalculating resources, clearing stale execution data, and
            sending the task back through the scheduler. Without this, the UI
            may show wrong resource usage or a failed task may accidentally
            complete later.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default FailureSimulationSection;
