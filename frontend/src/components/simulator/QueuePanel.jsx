// components/simulator/QueuePanel.jsx
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import TaskCard from "./TaskCard";
import { useViewMode } from "../../context/ViewModeContext";
import { useSimulator } from "../../context/SimulatorContext";

const QueuePanel = () => {
  const { isKitchen } = useViewMode();
  const { tasks, loading } = useSimulator();

  // Show only active tasks in the queue (waiting or running)
  const activeTasks = Array.isArray(tasks)
    ? tasks.filter((t) => t.status === "waiting" || t.status === "running")
    : [];

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: { xs: "auto", lg: 620 },
        p: { xs: 2, md: 2.5 },
        borderRadius: "28px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={2.4}>
        <Box>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5">
              {isKitchen ? "Order Queue" : "Task Queue"}
            </Typography>

            <Typography
              sx={{
                color: "primary.main",
                fontWeight: 800,
                fontSize: "0.85rem",
              }}
            >
              {activeTasks.length} ACTIVE
            </Typography>
          </Stack>

          <Typography
            sx={{ color: "text.secondary", mt: 0.6, lineHeight: 1.6 }}
          >
            {isKitchen
              ? "Incoming orders waiting for chef allocation."
              : "Incoming tasks waiting for resource allocation."}
          </Typography>
        </Box>

        <Stack
          spacing={1.4}
          sx={{
            overflowY: "scroll",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            height: 480,
          }}
        >
          {loading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.2,
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Skeleton variant="text" width="70%" height={18} />
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={48}
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}
            </>
          ) : !Array.isArray(tasks) || tasks.length === 0 ? (
            <Box
              sx={{
                p: 2,
                borderRadius: "18px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                {isKitchen ? "No orders yet" : "No tasks yet"}
              </Typography>

              <Typography
                sx={{ color: "text.secondary", mt: 0.6, fontSize: "0.9rem" }}
              >
                {isKitchen
                  ? "Create an order to start the kitchen allocation flow."
                  : "Create a task to start the scheduling flow."}
              </Typography>
            </Box>
          ) : (
            activeTasks.map((task, index) => (
              <TaskCard key={task._id || index} task={task} index={index} />
            ))
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default QueuePanel;
