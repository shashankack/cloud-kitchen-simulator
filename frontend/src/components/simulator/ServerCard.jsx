// components/simulator/ServerCard.jsx
import { memo } from "react";
import { Box, Stack, Typography, LinearProgress, Chip } from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { mapNamePair } from "../../utils/nameMapper";
import { useViewMode } from "../../context/ViewModeContext";

const ServerCard = ({ server, runningTasks = [], globalProgress = 0 }) => {
  const { isKitchen } = useViewMode();

  const getRemainingTime = (task) => {
    if (!task?.startedAt || task.status !== "running") return null;

    const startedAt = new Date(task.startedAt).getTime();
    const totalMs = (task.executionTime || 0) * 1000;
    const elapsedMs = Date.now() - startedAt;
    return Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
  };

  if (!server) return null;

  const name = server.name || "Unnamed";
  const { techName, kitchenName } = mapNamePair(name);
  const status = server.status || "unknown";
  const isAutoScaled = server.isAutoScaled || false;

  const usedCPU = typeof server.usedCPU === "number" ? server.usedCPU : 0;
  const totalCPU = typeof server.totalCPU === "number" ? server.totalCPU : 100;
  const cpuPct = Math.round((usedCPU / Math.max(1, totalCPU)) * 100);
  const freeCPU = Math.max(0, totalCPU - usedCPU);

  const usedRAM = typeof server.usedRAM === "number" ? server.usedRAM : 0;
  const totalRAM = typeof server.totalRAM === "number" ? server.totalRAM : 100;
  const ramPct = Math.round((usedRAM / Math.max(1, totalRAM)) * 100);
  const freeRAM = Math.max(0, totalRAM - usedRAM);

  const getAllocationLabel = (method) => {
    if (method === "bankers") return "Banker's";
    if (method === "idle-fill") return "Idle fill";
    return "Scheduled";
  };

  const getAllocationColor = (method) => {
    if (method === "bankers")
      return { bg: "rgba(76,201,240,0.18)", fg: "#7dd3fc" };
    if (method === "idle-fill")
      return { bg: "rgba(99,225,175,0.18)", fg: "#63e1af" };
    return { bg: "rgba(255,255,255,0.08)", fg: "text.secondary" };
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "16px",
        background: isAutoScaled
          ? "linear-gradient(135deg, rgba(99,225,175,0.08), rgba(99,225,175,0.03))"
          : "rgba(255,255,255,0.03)",
        border: isAutoScaled
          ? "1.5px solid rgba(99,225,175,0.3)"
          : "1px solid rgba(255,255,255,0.06)",
        position: "relative",
      }}
    >
      <Stack spacing={1.2}>
        <Stack
          direction="row"
          sx={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontWeight: 800 }}>
            {isKitchen ? kitchenName : techName}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            {isAutoScaled && (
              <Chip
                icon={<CloudUploadRoundedIcon />}
                label="Auto"
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  background: "rgba(99,225,175,0.15)",
                  color: "#63e1af",
                  "& .MuiChip-icon": {
                    marginLeft: "4px !important",
                    fontSize: "1rem",
                  },
                }}
              />
            )}
            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
              {status}
            </Typography>
          </Stack>
        </Stack>

        <Box
          sx={{
            p: 1.2,
            borderRadius: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Typography
            sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 0.4 }}
          >
            Capacity
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
            CPU: {usedCPU} / {totalCPU} used, {freeCPU} free
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
            RAM: {usedRAM} / {totalRAM} used, {freeRAM} free
          </Typography>
        </Box>

        <Box>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
            CPU — {cpuPct}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={globalProgress > 0 ? globalProgress : cpuPct}
            sx={{ height: 8, borderRadius: 2, mt: 0.6 }}
          />
        </Box>

        <Box>
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
            RAM — {ramPct}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={globalProgress > 0 ? globalProgress : ramPct}
            sx={{ height: 8, borderRadius: 2, mt: 0.6 }}
          />
        </Box>

        {runningTasks.length > 0 && (
          <Box
            sx={{ height: 120, overflowY: "scroll", scrollbarWidth: "none" }}
          >
            <Typography
              sx={{
                fontSize: "0.78rem",
                color: "text.secondary",
                mb: 0.8,
                position: "sticky",
                top: 0,
              }}
            >
              Running Tasks ({runningTasks.length})
            </Typography>
            <Stack spacing={0.7}>
              {runningTasks.map((task) => (
                <Box
                  key={task._id}
                  sx={{
                    px: 1,
                    py: 0.6,
                    borderRadius: "8px",
                    background: "rgba(76,201,240,0.08)",
                    border: "1px solid rgba(76,201,240,0.2)",
                  }}
                >
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: "#7dd3fc",
                          lineHeight: 1.2,
                        }}
                      >
                        {task.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.68rem",
                          color: "text.secondary",
                          mt: 0.2,
                        }}
                      >
                        Occupies {task.cpu ?? 0} CPU + {task.ram ?? 0} RAM
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={getAllocationLabel(task.allocationMethod)}
                      sx={{
                        height: 20,
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        background: getAllocationColor(task.allocationMethod)
                          .bg,
                        color: getAllocationColor(task.allocationMethod).fg,
                        flexShrink: 0,
                      }}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default memo(ServerCard);
