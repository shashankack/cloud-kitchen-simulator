import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";

import { useViewMode } from "../../context/ViewModeContext";

const schedulerSteps = [
  {
    icon: <SortRoundedIcon />,
    title: "Read waiting queue",
    kitchenTitle: "Read order queue",
    detail: "The scheduler starts by checking work that is still waiting.",
    kitchenDetail: "The kitchen manager checks orders that have not started yet.",
  },
  {
    icon: <SortRoundedIcon />,
    title: "Sort by priority",
    kitchenTitle: "Sort by urgency",
    detail: "Higher priority tasks are considered first. Older tasks win ties.",
    kitchenDetail: "Urgent orders are handled first. Older orders win ties.",
  },
  {
    icon: <MemoryRoundedIcon />,
    title: "Check server fit",
    kitchenTitle: "Check station fit",
    detail: "The task must fit inside available CPU and RAM.",
    kitchenDetail: "The order must fit inside cooking capacity and ingredients.",
  },
  {
    icon: <SecurityRoundedIcon />,
    title: "Run safety check",
    kitchenTitle: "Run kitchen safety check",
    detail: "The scheduler checks whether assigning this task keeps the system safe.",
    kitchenDetail: "The manager checks whether assigning this order keeps the kitchen stable.",
  },
  {
    icon: <PlayCircleRoundedIcon />,
    title: "Dispatch task",
    kitchenTitle: "Start preparation",
    detail: "If safe, the task moves from waiting to running.",
    kitchenDetail: "If safe, the order moves from queued to preparing.",
  },
  {
    icon: <SyncRoundedIcon />,
    title: "Emit update",
    kitchenTitle: "Update room",
    detail: "The room receives a realtime update so every user sees the same state.",
    kitchenDetail: "Everyone in the kitchen room sees the updated order status.",
  },
];

function SchedulerExplainerSection() {
  const { isKitchen } = useViewMode();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at top right, rgba(168,85,247,0.13), transparent 34%), rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<AccountTreeRoundedIcon />}
            label={isKitchen ? "Kitchen Manager Logic" : "Scheduler Logic"}
            sx={{
              width: "fit-content",
              color: "#c4b5fd",
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.22)",
              fontWeight: 800,
            }}
          />

          <Typography variant="h3">
            {isKitchen
              ? "How the kitchen manager decides what runs next"
              : "How the scheduler decides what runs next"}
          </Typography>

          <Typography
            sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 940 }}
          >
            {isKitchen
              ? "The kitchen manager does not randomly assign orders. It checks urgency, available station capacity, ingredients, and whether the kitchen can still recover after the decision."
              : "The scheduler does not randomly assign tasks. It checks priority, available server resources, and whether the system remains safe after the decision."}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {schedulerSteps.map((step, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={step.title}>
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
                      width: 44,
                      height: 44,
                      borderRadius: "16px",
                      display: "grid",
                      placeItems: "center",
                      color: "#c4b5fd",
                      background: "rgba(168,85,247,0.1)",
                    }}
                  >
                    {step.icon}
                  </Box>

                  <Typography sx={{ color: "#c4b5fd", fontWeight: 900 }}>
                    STEP {index + 1}
                  </Typography>

                  <Typography variant="h6">
                    {isKitchen ? step.kitchenTitle : step.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.65,
                      fontSize: "0.92rem",
                    }}
                  >
                    {isKitchen ? step.kitchenDetail : step.detail}
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
            The important lesson
          </Typography>

          <Typography sx={{ color: "text.secondary", mt: 0.8, lineHeight: 1.75 }}>
            Scheduling is not only about starting the next item. It is about
            choosing work in a way that keeps the whole system stable, resource
            usage accurate, and realtime users synchronized.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default SchedulerExplainerSection;