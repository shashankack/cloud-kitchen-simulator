// components

// components
import { Box, Button, Stack, Typography, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useRoom } from "../../context/RoomContext";
import { getSocket } from "../../api/socket";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import { useViewMode } from "../../context/ViewModeContext";
import { useSimulator } from "../../context/SimulatorContext";
import { mapNamePair } from "../../utils/nameMapper";

function TaskCard({ task, index }) {
  const { isKitchen } = useViewMode();
  const { retryTaskForRoom } = useSimulator();
  const [timeLeft, setTimeLeft] = useState(null);

  const refreshedRef = useRef(false);

  const { roomId } = useRoom();

  useEffect(() => {
    if (task.status === "paused") {
      setTimeLeft(Math.max(0, Math.ceil((task.remainingExecutionMs || 0) / 1000)));
      return;
    }

    if (task.status !== "running") {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const startedAt = new Date(task.startedAt).getTime();
      const executionTimeMs = (task.executionTime || 10) * 1000;
      const elapsedMs = Date.now() - startedAt;
      const remaining = Math.max(0, executionTimeMs - elapsedMs);
      const secsLeft = Math.ceil(remaining / 1000);
      setTimeLeft(secsLeft);

      if (secsLeft <= 0 && !refreshedRef.current) {
        refreshedRef.current = true;
        (async () => {
          try {
            if (!roomId) return;
            const s = getSocket();
            if (s && s.connected) {
              s.emit("tasks:refresh", { roomId });
            }
          } catch (e) {
            // ignore
          }
        })();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [task.status, task.startedAt, task.executionTime, task.remainingExecutionMs]);

  const priorityLabel =
    task.priority === 1 ? "High" : task.priority === 2 ? "Medium" : "Low";

  const priorityColor =
    task.priority === 1
      ? "#ef4444"
      : task.priority === 2
        ? "#f59e0b"
        : "#22c55e";

  const { techName, kitchenName } = mapNamePair(task.name);

  const handleRetry = async () => {
    await retryTaskForRoom(task._id);
  };

  const statusDisplay = (
    <Typography
      sx={{
        color:
          task.status === "running"
            ? "primary.main"
            : task.status === "waiting"
              ? "info.main"
              : task.status === "paused"
                ? "warning.main"
                : "warning.main",
        fontSize: "0.72rem",
        fontWeight: 900,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {task.status === "running" && timeLeft !== null
        ? timeLeft > 0
          ? `${timeLeft}s`
          : "Completing..."
        : task.status === "waiting"
          ? `${task.executionTime || 10}s`
          : task.status === "paused" && timeLeft !== null
            ? `${timeLeft}s paused`
          : task.status}
    </Typography>
  );

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "20px",
        background:
          task.status === "running"
            ? "linear-gradient(135deg, rgba(76,201,240,0.2), rgba(76,201,240,0.1))"
            : "rgba(255,255,255,0.04)",
        border:
          task.status === "running"
            ? "2px solid rgba(76,201,240,0.7)"
            : "1px solid rgba(255,255,255,0.06)",
        boxShadow:
          task.status === "running"
            ? "0 0 24px rgba(76,201,240,0.35), 0 0 12px rgba(76,201,240,0.15), inset 0 0 16px rgba(76,201,240,0.1)"
            : "none",
        transition:
          "transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease",
        animation:
          task.status === "running"
            ? "assignmentGlow 2.5s ease-in-out infinite"
            : "none",
        "@keyframes assignmentGlow": {
          "0%, 100%": {
            boxShadow:
              "0 0 20px rgba(76,201,240,0.25), 0 0 8px rgba(76,201,240,0.1), inset 0 0 12px rgba(76,201,240,0.06)",
          },
          "50%": {
            boxShadow:
              "0 0 36px rgba(76,201,240,0.45), 0 0 20px rgba(76,201,240,0.25), inset 0 0 24px rgba(76,201,240,0.15)",
          },
        },
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor:
            task.status === "running"
              ? "rgba(76,201,240,0.9)"
              : "rgba(76,201,240,0.22)",
          background:
            task.status === "running"
              ? "linear-gradient(135deg, rgba(76,201,240,0.25), rgba(76,201,240,0.15))"
              : "rgba(255,255,255,0.055)",
        },
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between" }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,0.055)",
                color: "text.secondary",
                fontWeight: 900,
                fontSize: "0.78rem",
              }}
            >
              {index + 1}
            </Box>

            <Typography sx={{ fontWeight: 800 }}>
              {isKitchen ? kitchenName : techName}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.2} sx={{ alignItems: "center" }}>
            {task.status === "failed" && task.failureReason ? (
              <Tooltip title={task.failureReason} arrow>
                {statusDisplay}
              </Tooltip>
            ) : (
              statusDisplay
            )}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {[
            [isKitchen ? "Capacity" : "CPU", task.cpu],
            [isKitchen ? "Ingredients" : "RAM", task.ram],
            ["Priority", priorityLabel],
          ].map(([label, value]) => (
            <Box
              key={label}
              sx={{
                px: 1.1,
                py: 0.55,
                borderRadius: "10px",
                background: "rgba(255,255,255,0.045)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Typography
                sx={{
                  color:
                    label === "Priority" ? priorityColor : "text.secondary",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                }}
              >
                {label}: {value}
              </Typography>
            </Box>
          ))}
        </Stack>

        {task.status === "failed" && (
          <Button
            onClick={handleRetry}
            variant="outlined"
            size="small"
            startIcon={<ReplayRoundedIcon />}
            sx={{
              alignSelf: "flex-start",
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
            Retry task
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export default TaskCard;
