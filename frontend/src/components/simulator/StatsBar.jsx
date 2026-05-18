// components/simulator/StatsBar.jsx
import { Box, Grid, Stack, Typography, Skeleton } from "@mui/material";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useViewMode } from "../../context/ViewModeContext";
import { useSimulator } from "../../context/SimulatorContext";

function StatCard({ icon, label, value, helper }) {
  return (
    <Box
      sx={{
        height: "100%",
        p: 2.4,
        borderRadius: "24px",
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.07)",
        transition: "transform 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "rgba(76,201,240,0.24)",
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "16px",
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            background: "rgba(76,201,240,0.1)",
            border: "1px solid rgba(76,201,240,0.16)",
            "& svg": { fontSize: 25 },
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
            {label}
          </Typography>

          <Typography variant="h5">{value}</Typography>

          <Typography sx={{ color: "text.disabled", fontSize: "0.78rem" }}>
            {helper}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function StatsBar() {
  const { isKitchen } = useViewMode();
  const { tasks = [], servers = [], loading } = useSimulator();

  const waitingTasks = tasks.filter((t) => t.status === "waiting").length;
  const pausedTasks = tasks.filter((t) => t.status === "paused").length;
  const activeServers = servers.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  // compute average CPU load across servers
  let systemLoad = 0;
  if (servers.length) {
    const totalPct = servers.reduce((sum, s) => {
      const used = typeof s.usedCPU === "number" ? s.usedCPU : 0;
      const total = typeof s.totalCPU === "number" ? s.totalCPU : 1;
      return sum + used / Math.max(1, total);
    }, 0);
    systemLoad = Math.round((totalPct / servers.length) * 100);
  }

  const stats = [
    {
      icon: <PendingActionsRoundedIcon />,
      label: isKitchen ? "Waiting Orders" : "Waiting Tasks",
      value: loading ? "..." : String(waitingTasks).padStart(2, "0"),
      helper: loading
        ? "loading"
        : pausedTasks > 0
          ? `${pausedTasks} paused`
          : isKitchen
            ? "in order queue"
            : "in task queue",
    },
    {
      icon: <MemoryRoundedIcon />,
      label: isKitchen ? "Active Chefs" : "Active Servers",
      value: loading ? "..." : String(activeServers).padStart(2, "0"),
      helper: isKitchen ? "available stations" : "online machines",
    },
    {
      icon: <SpeedRoundedIcon />,
      label: isKitchen ? "Kitchen Load" : "System Load",
      value: loading ? "..." : `${systemLoad}%`,
      helper: isKitchen ? "current pressure" : "resource usage",
    },
    {
      icon: <CheckCircleRoundedIcon />,
      label: isKitchen ? "Served Orders" : "Completed Tasks",
      value: loading ? "..." : String(completedTasks).padStart(2, "0"),
      helper: "completed successfully",
    },
  ];

  return (
    <Grid container spacing={2}>
      {loading
        ? [...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
              <Skeleton
                variant="rectangular"
                height={92}
                sx={{ borderRadius: 0.5 }}
              />
            </Grid>
          ))
        : stats.map((stat) => (
            <Grid size={{ xs: 6, sm: 6, lg: 3 }} key={stat.label}>
              <StatCard {...stat} />
            </Grid>
          ))}
    </Grid>
  );
}

export default StatsBar;
