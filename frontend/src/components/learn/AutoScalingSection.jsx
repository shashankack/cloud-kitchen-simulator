import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import AutoAwesomeMotionRoundedIcon from "@mui/icons-material/AutoAwesomeMotionRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import CleaningServicesRoundedIcon from "@mui/icons-material/CleaningServicesRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";

import { useViewMode } from "../../context/ViewModeContext";

const scalingSteps = [
  {
    icon: <SpeedRoundedIcon />,
    title: "Demand increases",
    kitchenTitle: "Orders pile up",
    detail:
      "When the waiting queue grows, the system needs more execution capacity.",
    kitchenDetail:
      "When too many orders wait, the kitchen needs more preparation capacity.",
  },
  {
    icon: <AddCircleRoundedIcon />,
    title: "Temporary server is added",
    kitchenTitle: "Temporary station is added",
    detail:
      "The backend can create an auto-scaled server to help process queued tasks.",
    kitchenDetail:
      "The kitchen can open an extra station to help process queued orders.",
  },
  {
    icon: <TimelineRoundedIcon />,
    title: "Load is reduced",
    kitchenTitle: "Rush is reduced",
    detail:
      "More capacity allows waiting tasks to move into running state faster.",
    kitchenDetail:
      "More capacity allows waiting orders to start preparation faster.",
  },
  {
    icon: <CleaningServicesRoundedIcon />,
    title: "Unused capacity is cleaned",
    kitchenTitle: "Extra station is closed",
    detail:
      "Auto-scaled servers should be removed when they are no longer needed.",
    kitchenDetail: "Temporary stations should close when the rush is over.",
  },
];

function AutoScalingSection() {
  const { isKitchen } = useViewMode();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at top right, rgba(14,165,233,0.14), transparent 34%), rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<AutoAwesomeMotionRoundedIcon />}
            label={isKitchen ? "Dynamic Kitchen Capacity" : "Auto Scaling"}
            sx={{
              width: "fit-content",
              color: "#7dd3fc",
              background: "rgba(14,165,233,0.1)",
              border: "1px solid rgba(14,165,233,0.22)",
              fontWeight: 800,
            }}
          />

          <Typography variant="h3">
            {isKitchen
              ? "Why the kitchen opens extra stations"
              : "Why the system creates extra servers"}
          </Typography>

          <Typography
            sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 920 }}
          >
            {isKitchen
              ? "Auto scaling teaches how a system reacts when demand is higher than available capacity. In kitchen mode, that means opening extra chef stations during a rush and closing them when they are no longer useful."
              : "Auto scaling teaches how systems react when workload is higher than available compute. The simulator can add temporary servers during pressure and clean them up when the load drops."}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {scalingSteps.map((step, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={step.title}>
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
                      color: "#7dd3fc",
                      background: "rgba(14,165,233,0.1)",
                    }}
                  >
                    {step.icon}
                  </Box>

                  <Typography sx={{ color: "#7dd3fc", fontWeight: 900 }}>
                    0{index + 1}
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
            The important trade-off
          </Typography>

          <Typography
            sx={{ color: "text.secondary", mt: 0.8, lineHeight: 1.75 }}
          >
            Auto scaling improves throughput, but it is not free. More servers
            mean more state to track, more resource calculations, more cleanup
            logic, and more chances for bugs if temporary capacity is not
            removed correctly.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default AutoScalingSection;
