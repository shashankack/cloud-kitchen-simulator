import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";

import { useViewMode } from "../../context/ViewModeContext";

const performanceConcepts = [
  {
    icon: <TrendingUpRoundedIcon />,
    title: "Queue buildup",
    kitchenTitle: "Order buildup",
    detail:
      "When incoming work arrives faster than the system can process it, waiting queues begin to grow.",
    kitchenDetail:
      "When orders arrive faster than chefs can prepare them, the kitchen queue grows.",
  },
  {
    icon: <HourglassBottomRoundedIcon />,
    title: "Bottlenecks",
    kitchenTitle: "Kitchen bottlenecks",
    detail:
      "A single overloaded server can slow down the entire system even if other servers are idle.",
    kitchenDetail:
      "One overloaded chef station can slow the entire kitchen even if others are free.",
  },
  {
    icon: <WarningAmberRoundedIcon />,
    title: "Resource exhaustion",
    kitchenTitle: "Capacity exhaustion",
    detail:
      "Tasks cannot run if required CPU or RAM is unavailable.",
    kitchenDetail:
      "Orders cannot start if cooking capacity or ingredients are unavailable.",
  },
  {
    icon: <BalanceRoundedIcon />,
    title: "Load balancing",
    kitchenTitle: "Balancing kitchen load",
    detail:
      "Schedulers try to spread work across servers instead of overwhelming one node.",
    kitchenDetail:
      "Kitchen managers try to distribute orders across stations instead of overwhelming one chef.",
  },
  {
    icon: <AutoGraphRoundedIcon />,
    title: "Throughput",
    kitchenTitle: "Kitchen throughput",
    detail:
      "Good systems maximize completed work over time while staying stable.",
    kitchenDetail:
      "Good kitchens maximize completed orders over time without chaos.",
  },
];

function PerformanceAndScalabilitySection() {
  const { isKitchen } = useViewMode();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at bottom left, rgba(236,72,153,0.13), transparent 34%), rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<SpeedRoundedIcon />}
            label={isKitchen ? "Kitchen Performance" : "Performance & Scalability"}
            sx={{
              width: "fit-content",
              color: "#f9a8d4",
              background: "rgba(236,72,153,0.1)",
              border: "1px solid rgba(236,72,153,0.22)",
              fontWeight: 800,
            }}
          />

          <Typography variant="h3">
            {isKitchen
              ? "Why some kitchens slow down under pressure"
              : "Why systems slow down under pressure"}
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.8,
              maxWidth: 940,
            }}
          >
            {isKitchen
              ? "As more orders enter the kitchen, the system experiences pressure. Bottlenecks, overloaded stations, ingredient limits, and queue buildup all affect how quickly orders can be completed."
              : "As more tasks enter the system, performance pressure increases. Bottlenecks, overloaded servers, resource exhaustion, and queue buildup all affect throughput and stability."}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {performanceConcepts.map((concept) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={concept.title}
            >
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
                      color: "#f9a8d4",
                      background: "rgba(236,72,153,0.1)",
                    }}
                  >
                    {concept.icon}
                  </Box>

                  <Typography variant="h6">
                    {isKitchen
                      ? concept.kitchenTitle
                      : concept.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.65,
                      fontSize: "0.92rem",
                    }}
                  >
                    {isKitchen
                      ? concept.kitchenDetail
                      : concept.detail}
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
            The systems lesson
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              mt: 0.8,
              lineHeight: 1.75,
            }}
          >
            Scalability is not just about adding more servers. A scalable system
            must distribute work correctly, recover from overload, prevent
            bottlenecks, and maintain stable throughput as demand grows.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default PerformanceAndScalabilitySection;