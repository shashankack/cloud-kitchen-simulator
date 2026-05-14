// components/simulator/ServerGrid.jsx
import { useMemo } from "react";
import { Grid, Stack, Typography, Box, Skeleton } from "@mui/material";
import ServerCard from "./ServerCard";
import { useViewMode } from "../../context/ViewModeContext";
import { useSimulator } from "../../context/SimulatorContext";

function ServerGrid() {
  const { isKitchen } = useViewMode();
  const { servers, tasks, globalProgress, loading } = useSimulator();

  const runningTasksByServer = useMemo(() => {
    const byServer = new Map();

    for (const task of tasks) {
      if (task.status !== "running" || !task.assignedServer?._id) continue;

      const serverId = task.assignedServer._id;
      const current = byServer.get(serverId);
      if (current) current.push(task);
      else byServer.set(serverId, [task]);
    }

    return byServer;
  }, [tasks]);

  return (
    <Box>
      <Stack spacing={0.8} sx={{ mb: 2 }}>
        <Typography variant="h5">
          {isKitchen ? "Chef Stations" : "Server Cluster"}
        </Typography>

        <Typography sx={{ color: "text.secondary" }}>
          {isKitchen
            ? "Monitor chef capacity and ingredient usage."
            : "Monitor CPU, RAM, and server load distribution."}
        </Typography>
      </Stack>

      <Grid container spacing={2.5}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Box sx={{ p: 2 }}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </Box>
            </Grid>
          ))
        ) : servers && servers.length ? (
          servers.map((server) => (
            <Grid size={{ xs: 12, md: 4 }} key={server._id || server.name}>
              <Box sx={{ contentVisibility: "auto", containIntrinsicSize: "220px" }}>
                <ServerCard
                  server={server}
                  runningTasks={runningTasksByServer.get(server._id) || []}
                  globalProgress={globalProgress}
                />
              </Box>
            </Grid>
          ))
        ) : (
          <Typography sx={{ color: "text.secondary" }}>No servers found</Typography>
        )}
      </Grid>
    </Box>
  );
}

export default ServerGrid;
