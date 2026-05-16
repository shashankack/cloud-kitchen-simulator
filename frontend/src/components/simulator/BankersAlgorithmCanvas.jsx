import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Grid,
  LinearProgress,
  Alert,
  Button,
  Skeleton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import InfoIcon from "@mui/icons-material/Info";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useViewMode } from "../../context/ViewModeContext";
import { useSimulator } from "../../context/SimulatorContext";
import { mapNamePair } from "../../utils/nameMapper";

function BankersAlgorithmCanvas({ tasks = [], servers = [] }) {
  const { isKitchen } = useViewMode();
  const { retryTaskForRoom, retryAllFailedTasksForRoom, globalProgress, loading, deadlockEnabled, lastAllocations } = useSimulator();
  const [now, setNow] = useState(Date.now());
  const [selectedServer, setSelectedServer] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total available resources
  const totalCPU = servers.reduce((sum, s) => sum + s.totalCPU, 0);
  const totalRAM = servers.reduce((sum, s) => sum + s.totalRAM, 0);

    // Servers involved in recent unsafe allocations
    const unsafeServerIds = new Set();
    if (lastAllocations && Array.isArray(lastAllocations)) {
      lastAllocations.forEach((a) => {
        if (a.unsafe && a.serverId) unsafeServerIds.add(a.serverId);
      });
    }

    const openServerAllocations = (server) => {
      setSelectedServer(server);
    };

    const closeServerAllocations = () => setSelectedServer(null);

  // Calculate used resources
  const usedCPU = servers.reduce((sum, s) => sum + s.usedCPU, 0);
  const usedRAM = servers.reduce((sum, s) => sum + s.usedRAM, 0);
  const idleServers = servers.filter((s) => (s.usedCPU || 0) === 0 && (s.usedRAM || 0) === 0);

  // Available resources
  const availableCPU = totalCPU - usedCPU;
  const availableRAM = totalRAM - usedRAM;

  // Categorize tasks
  const runningTasks = tasks.filter((t) => t.status === "running");
  const waitingTasks = tasks.filter((t) => t.status === "waiting");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const failedTasks = tasks.filter((t) => t.status === "failed");

  // Calculate demand for waiting tasks
  const totalDemandCPU = waitingTasks.reduce((sum, t) => sum + t.cpu, 0);
  const totalDemandRAM = waitingTasks.reduce((sum, t) => sum + t.ram, 0);

  // Check if system is in safe state
  const isSafe = availableCPU >= totalDemandCPU && availableRAM >= totalDemandRAM;

  const cpuPercent = totalCPU > 0 ? Math.round((usedCPU / totalCPU) * 100) : 0;
  const ramPercent = totalRAM > 0 ? Math.round((usedRAM / totalRAM) * 100) : 0;

  const getRemainingTime = (task) => {
    if (!task?.startedAt || task.status !== "running") return null;

    const startedAt = new Date(task.startedAt).getTime();
    const totalMs = (task.executionTime || 0) * 1000;
    const elapsedMs = now - startedAt;
    return Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
  };

  const handleRetryTask = async (taskId) => {
    await retryTaskForRoom(taskId);
  };

  const handleRetryAllFailed = async () => {
    await retryAllFailedTasksForRoom();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Skeleton width="40%" height={36} />
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: { xs: "auto", md: "auto" },
        borderRadius: "28px",
        overflow: "hidden auto",
        border: "1px solid rgba(255,255,255,0.07)",
        background: `
          radial-gradient(circle at center, rgba(76,201,240,0.13), transparent 32%),
          radial-gradient(circle at top right, rgba(168,85,247,0.14), transparent 34%),
          rgba(255,255,255,0.025)
        `,
        p: 3,
      }}
    >
      <Stack spacing={3}>
        {/* Title and System Status */}
        <Stack spacing={1.5}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {isKitchen ? "🍳 Kitchen Resource Manager" : "🏦 Banker's Safety Algorithm"}
          </Typography>

          <Alert
            icon={
              isSafe ? (
                <CheckCircleIcon sx={{ fontSize: "1.5rem" }} />
              ) : (
                <PendingActionsIcon sx={{ fontSize: "1.5rem" }} />
              )
            }
            severity={isSafe ? "success" : "warning"}
            sx={{
              background: isSafe
                ? "rgba(34,197,94,0.1)"
                : "rgba(239,68,68,0.1)",
              borderColor: isSafe
                ? "rgba(34,197,94,0.3)"
                : "rgba(239,68,68,0.3)",
              color: isSafe ? "#22c55e" : "#ef4444",
            }}
          >
            <Stack spacing={0.5}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                {isSafe ? "✓ SYSTEM IN SAFE STATE" : "⚠ SYSTEM IN UNSAFE STATE"}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem" }}>
                {isSafe
                  ? isKitchen
                    ? "All pending orders can be safely prepared without running out of kitchen capacity."
                    : "All waiting processes can be allocated resources without risking a deadlock."
                  : isKitchen
                    ? "Cannot safely start new orders - not enough kitchen capacity available."
                    : "Cannot safely allocate resources - system might deadlock."}
              </Typography>
            </Stack>
          </Alert>

          <Alert
            icon={<InfoIcon sx={{ fontSize: "1.4rem" }} />}
            severity="info"
            sx={{
              background: "rgba(59,130,246,0.1)",
              borderColor: "rgba(59,130,246,0.3)",
              color: "#93c5fd",
            }}
          >
            <Typography sx={{ fontSize: "0.85rem" }}>
              Secondary pass enabled: {idleServers.length} idle server{idleServers.length === 1 ? "" : "s"} can be used to absorb leftover waiting tasks after the Banker check.
            </Typography>
          </Alert>

          {/* Unsafe allocations notice when deadlock simulation is enabled */}
          {deadlockEnabled && lastAllocations && lastAllocations.length > 0 && (
            (() => {
              const unsafe = lastAllocations.filter((a) => a.unsafe);
              if (unsafe.length === 0) return null;
              return (
                <Alert
                  icon={<PendingActionsIcon sx={{ fontSize: "1.4rem" }} />}
                  severity="error"
                  sx={{
                    background: "rgba(239,68,68,0.08)",
                    borderColor: "rgba(239,68,68,0.22)",
                    color: "#fca5a5",
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                      Unsafe allocations performed while Deadlock Simulation is enabled
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem" }}>
                      The scheduler allocated resources despite failing the Banker's safety check. Affected allocations:
                    </Typography>
                    <Stack sx={{ mt: 1 }}>
                      {unsafe.map((a, idx) => {
                        const task = a.task || {};
                        const server = servers.find((s) => s._id === a.serverId) || {};
                        return (
                          <Typography key={idx} sx={{ fontSize: "0.85rem" }}>
                            • {task.name || task._id} → {server.name || a.serverId}
                          </Typography>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Alert>
              );
            })()
          )}
        </Stack>

        {/* System Overview */}
        <Paper
          sx={{
            p: 2.5,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
          }}
        >
          <Stack spacing={2}>
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              📊 Total {isKitchen ? "Kitchen Capacity" : "System Resources"}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {isKitchen ? "Cooking Capacity" : "CPU"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: "primary.main",
                      }}
                    >
                      {usedCPU} / {totalCPU}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={globalProgress > 0 ? globalProgress : cpuPercent}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      mt: 0.8,
                    }}
                  >
                    {cpuPercent}% used • {availableCPU} available
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {isKitchen ? "Ingredients" : "RAM"}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        color: "primary.main",
                      }}
                    >
                      {usedRAM} / {totalRAM}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={globalProgress > 0 ? globalProgress : ramPercent}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      mt: 0.8,
                    }}
                  >
                    {ramPercent}% used • {availableRAM} available
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        {/* Servers Overview (highlight unsafe servers) */}
        <Paper sx={{ p: 2.5, mt: 2, background: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", color: "text.secondary", mb: 1 }}>
            🖥️ Servers ({servers.length})
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {servers.map((s) => {
              const isUnsafe = unsafeServerIds.has(s._id);
              return (
                <Paper
                  key={s._id}
                  onClick={() => openServerAllocations(s)}
                  sx={{
                    p: 1,
                    minWidth: 160,
                    mr: 1,
                    mb: 1,
                    borderRadius: 2,
                    cursor: "pointer",
                    border: isUnsafe ? "2px solid rgba(239,68,68,0.9)" : "1px solid rgba(255,255,255,0.06)",
                    background: isUnsafe ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.02)",
                    transition: "transform 160ms ease",
                    '&:hover': { transform: 'translateY(-3px)' },
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.6)' },
                      '70%': { boxShadow: '0 0 0 8px rgba(239,68,68,0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
                    },
                    animation: isUnsafe ? 'pulse 1.6s infinite' : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 800 }}>{s.name}</Typography>
                    {isUnsafe && <Chip label="UNSAFE" size="small" color="error" sx={{ fontWeight: 800 }} />}
                  </Box>
                  <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{s.usedCPU || 0}/{s.totalCPU} CPU • {s.usedRAM || 0}/{s.totalRAM} RAM</Typography>
                </Paper>
              );
            })}
          </Stack>
        </Paper>

        {/* Allocation Timeline */}
        {lastAllocations && lastAllocations.length > 0 && (
          <Paper sx={{ p: 2, mt: 2, background: "rgba(255,255,255,0.02)", borderRadius: 2 }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", color: "text.secondary", mb: 1 }}>
              🕒 Recent Allocations
            </Typography>
            <Stack spacing={1}>
              {lastAllocations.slice(-8).reverse().map((a, idx) => {
                const task = a.task || {};
                const server = servers.find((s) => s._id === a.serverId) || {};
                const age = a.ts ? Math.max(0, Math.floor((now - a.ts) / 1000)) : null;
                return (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center" sx={{ justifyContent: "space-between" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: a.unsafe ? "#ef4444" : "#22c55e" }} />
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 800 }}>
                        {task.name || task._id} → {server.name || a.serverId}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>{age !== null ? `${age}s ago` : "just now"}</Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Paper>
        )}

        {/* Currently Active */}
        <Paper
          sx={{
            p: 2.5,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 800,
              textTransform: "uppercase",
              color: "text.secondary",
              mb: 2,
            }}
          >
            ⚡ Currently {isKitchen ? "Cooking" : "Running"} ({runningTasks.length})
          </Typography>

          {runningTasks.length === 0 ? (
            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              No {isKitchen ? "orders" : "processes"} currently executing
            </Typography>
          ) : (
            <Stack spacing={1.2}>
              {runningTasks.slice(0, 5).map((task) => {
                const { techName, kitchenName } = mapNamePair(task.name);
                const displayName = isKitchen ? kitchenName : techName;
                const remaining = getRemainingTime(task);

                return (
                  <Box
                    key={task._id}
                    sx={{
                      p: 1.5,
                      borderRadius: "10px",
                      background: "rgba(76,201,240,0.12)",
                      border: "1px solid rgba(76,201,240,0.3)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
                        {displayName}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8rem", color: "primary.main" }}>
                        Uses {task.cpu} {isKitchen ? "cap" : "CPU"} + {task.ram} {isKitchen ? "ing" : "RAM"}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.8rem", color: "#4cc9f0", fontWeight: 800 }}>
                      {remaining !== null ? `${remaining}s left` : "Running"}
                    </Typography>
                  </Box>
                );
              })}
              {runningTasks.length > 5 && (
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mt: 1 }}>
                  +{runningTasks.length - 5} more...
                </Typography>
              )}
            </Stack>
          )}
        </Paper>

        {/* Waiting Queue Analysis */}
        <Paper
          sx={{
            p: 2.5,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
          }}
        >

        {/* Failed Tasks */}
        <Paper
          sx={{
            p: 2.5,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }} spacing={2}>
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "text.secondary",
                }}
              >
                ❌ Failed Tasks ({failedTasks.length})
              </Typography>

              {failedTasks.length > 0 && (
                <Button
                  onClick={handleRetryAllFailed}
                  variant="outlined"
                  size="small"
                  startIcon={<ReplayRoundedIcon />}
                  sx={{
                    borderColor: "rgba(239,68,68,0.35)",
                    color: "#fca5a5",
                    background: "rgba(239,68,68,0.06)",
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: "999px",
                    px: 1.5,
                    "&:hover": {
                      borderColor: "rgba(239,68,68,0.7)",
                      background: "rgba(239,68,68,0.12)",
                    },
                  }}
                >
                  Retry all
                </Button>
              )}
            </Stack>

            {failedTasks.length === 0 ? (
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                No failed tasks right now
              </Typography>
            ) : (
              <Stack spacing={1.2}>
                {failedTasks.slice(0, 5).map((task) => {
                  const { techName, kitchenName } = mapNamePair(task.name);
                  const displayName = isKitchen ? kitchenName : techName;

                  return (
                    <Tooltip
                      key={task._id}
                      title={task.failureReason || "Task failed due to a simulated runtime issue"}
                      arrow
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "10px",
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
                            {displayName}
                          </Typography>
                          <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.3 }}>
                            Failed {task.cpu} {isKitchen ? "cap" : "CPU"} + {task.ram} {isKitchen ? "ing" : "RAM"}
                          </Typography>
                        </Box>

                        <Button
                          onClick={() => handleRetryTask(task._id)}
                          variant="outlined"
                          size="small"
                          startIcon={<ReplayRoundedIcon />}
                          sx={{
                            borderColor: "rgba(239,68,68,0.35)",
                            color: "#fca5a5",
                            background: "rgba(239,68,68,0.06)",
                            textTransform: "none",
                            fontWeight: 800,
                            borderRadius: "999px",
                            px: 1.5,
                            "&:hover": {
                              borderColor: "rgba(239,68,68,0.7)",
                              background: "rgba(239,68,68,0.12)",
                            },
                          }}
                        >
                          Retry
                        </Button>
                      </Box>
                    </Tooltip>
                  );
                })}

                {failedTasks.length > 5 && (
                  <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mt: 1 }}>
                    +{failedTasks.length - 5} more failed tasks...
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
          <Stack spacing={2}>
            <Typography
              sx={{
                fontSize: "0.85rem",
                fontWeight: 800,
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              ⏳ Waiting in Queue ({waitingTasks.length})
            </Typography>

            {waitingTasks.length === 0 ? (
              <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                Queue is empty
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {waitingTasks.slice(0, 6).map((task) => {
                  const { techName, kitchenName } = mapNamePair(task.name);
                  const displayName = isKitchen ? kitchenName : techName;
                  const canAllocate =
                    availableCPU >= task.cpu && availableRAM >= task.ram;

                  return (
                    <Box
                      key={task._id}
                      sx={{
                        p: 1.5,
                        borderRadius: "10px",
                        background: canAllocate
                          ? "rgba(34,197,94,0.08)"
                          : "rgba(239,68,68,0.08)",
                        border: canAllocate
                          ? "1px solid rgba(34,197,94,0.3)"
                          : "1px solid rgba(239,68,68,0.3)",
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
                            {displayName}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.8rem",
                              color: "text.secondary",
                              mt: 0.3,
                            }}
                          >
                            Needs: {task.cpu} {isKitchen ? "cap" : "CPU"} + {task.ram} {isKitchen ? "ing" : "RAM"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            px: 1.2,
                            py: 0.6,
                            borderRadius: "6px",
                            background: canAllocate
                              ? "rgba(34,197,94,0.2)"
                              : "rgba(239,68,68,0.2)",
                            textAlign: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 900,
                              color: canAllocate ? "#22c55e" : "#ef4444",
                            }}
                          >
                            {canAllocate ? "✓ READY" : "✗ WAITING"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
                {waitingTasks.length > 6 && (
                  <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mt: 1 }}>
                    +{waitingTasks.length - 6} more in queue...
                  </Typography>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Algorithm Explanation */}
        <Alert
          icon={<InfoIcon />}
          severity="info"
          sx={{
            background: "rgba(59,130,246,0.1)",
            borderColor: "rgba(59,130,246,0.3)",
            color: "info.main",
          }}
        >
          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: 800, fontSize: "0.9rem" }}>
              How It Works
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
              {isKitchen
                ? "The system checks if there's enough kitchen capacity to safely start new orders without running out of chefs or ingredients. When an order finishes, resources are freed for the next waiting order."
                : "The system uses the Banker's Algorithm to ensure safe resource allocation. Before assigning resources to a waiting process, the system verifies that completing the running processes will eventually free enough resources for all waiting processes."}
            </Typography>
          </Stack>
        </Alert>

        {/* Statistics Footer */}
        <Grid container spacing={1.5}>
          <Grid size={{xs: 6, md: 3}}>
            <Paper
              sx={{
                p: 2,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}>
                Completed
              </Typography>
              <Typography
                sx={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "#22c55e",
                }}
              >
                {completedTasks.length}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{xs: 6, md: 3}}>
            <Paper
              sx={{
                p: 2,
                background: "rgba(76,201,240,0.1)",
                border: "1px solid rgba(76,201,240,0.2)",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}>
                Active
              </Typography>
              <Typography
                sx={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "primary.main",
                }}
              >
                {runningTasks.length}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{xs: 6, md: 3}}>
            <Paper
              sx={{
                p: 2,
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}>
                Waiting
              </Typography>
              <Typography
                sx={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "#3b82f6",
                }}
              >
                {waitingTasks.length}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{xs: 6, md: 3}}>
            <Paper
              sx={{
                p: 2,
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mb: 0.5 }}>
                Failed
              </Typography>
              <Typography
                sx={{
                  fontSize: "2rem",
                  fontWeight: 900,
                  color: "#ef4444",
                }}
              >
                {failedTasks.length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
      {/* Server allocations dialog */}
      <Dialog open={Boolean(selectedServer)} onClose={closeServerAllocations} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Recent allocations for {selectedServer?.name || ''}</span>
          <CloseRoundedIcon onClick={closeServerAllocations} sx={{ cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent>
          <List>
            {(lastAllocations || []).filter((a) => a.serverId === selectedServer?._id).slice(-12).reverse().map((a, i) => {
              const task = a.task || {};
              const age = a.ts ? Math.max(0, Math.floor((now - a.ts) / 1000)) : null;
              return (
                <ListItem key={i} divider>
                  <ListItemText
                    primary={`${task.name || task._id} ${a.unsafe ? ' (UNSAFE)' : ''}`}
                    secondary={`${a.unsafe ? 'unsafe allocation • ' : ''}${age !== null ? `${age}s ago` : 'just now'}`}
                  />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default BankersAlgorithmCanvas;
