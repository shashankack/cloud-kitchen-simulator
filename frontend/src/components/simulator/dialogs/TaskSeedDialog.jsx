import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  Button,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useSimulator } from "../../../context/SimulatorContext";
const MAX_TASK_SEED_COUNT = 300;

export default function TaskSeedDialog({ open, onClose, append = false }) {
  const { seedTasksForRoom, resumeSchedulerForRoom } = useSimulator();
  const [count, setCount] = useState(6);
  const [intensity, setIntensity] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // replicate seed samples to provide preview ranges
  const samples = [
    { name: "Image Processing", cpu: 4, ram: 8, executionTime: 10 },
    { name: "Data Sync", cpu: 2, ram: 4, executionTime: 6 },
    { name: "Report Build", cpu: 6, ram: 12, executionTime: 20 },
    { name: "Video Encode", cpu: 8, ram: 16, executionTime: 30 },
    { name: "Thumbnail Gen", cpu: 1, ram: 1, executionTime: 3 },
    { name: "ML Inference", cpu: 10, ram: 24, executionTime: 45 },
  ];

  function getProfile(intensity) {
    const normalized = String(intensity || "normal").toLowerCase();
    if (normalized === "low")
      return {
        cpuFactor: 0.6,
        ramFactor: 0.6,
        execFactor: 0.85,
        cpuOffset: 0,
        ramOffset: 0,
      };
    if (normalized === "high")
      return {
        cpuFactor: 1.45,
        ramFactor: 1.5,
        execFactor: 1.15,
        cpuOffset: 1,
        ramOffset: 2,
      };
    return {
      cpuFactor: 1,
      ramFactor: 1,
      execFactor: 1,
      cpuOffset: 0,
      ramOffset: 0,
    };
  }

  function computePreview(intensity) {
    const profile = getProfile(intensity);
    const cpus = samples.map((s) =>
      Math.max(1, Math.round(s.cpu * profile.cpuFactor) + profile.cpuOffset),
    );
    const rams = samples.map((s) =>
      Math.max(1, Math.round(s.ram * profile.ramFactor) + profile.ramOffset),
    );
    const execs = samples.map((s) =>
      Math.max(1, Math.round(s.executionTime * profile.execFactor)),
    );
    return {
      cpuMin: Math.min(...cpus),
      cpuMax: Math.max(...cpus),
      ramMin: Math.min(...rams),
      ramMax: Math.max(...rams),
      execMin: Math.min(...execs),
      execMax: Math.max(...execs),
    };
  }

  const preview = computePreview(intensity);

  const { showToast } = useSimulator();

  const handleSeed = async () => {
    setLoading(true);
    setError("");
    try {
      const docs = await seedTasksForRoom(Number(count) || 6, intensity, append);
      const n = Array.isArray(docs) ? docs.length : 0;
      showToast(
        append ? `${n} tasks appended` : `${n} tasks seeded`,
        "success",
        4000,
      );
      try {
        // Ensure scheduler is resumed after large seed operations
        if (typeof resumeSchedulerForRoom === "function") {
          await resumeSchedulerForRoom();
        }
      } catch (e) {
        /* ignore */
      }
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || "Failed to seed tasks",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{append ? "Append Tasks" : "Seed Tasks"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography sx={{ color: "text.secondary" }}>
            How many tasks would you like to create? Max 300 per seed to keep
            the simulator responsive.
          </Typography>
          <TextField
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            fullWidth
            inputProps={{ min: 1, max: MAX_TASK_SEED_COUNT }}
            helperText={`Limit: 1 - ${MAX_TASK_SEED_COUNT} tasks`}
          />
          <Stack spacing={1}>
            <Typography sx={{ color: "text.secondary" }}>
              Resource intensity
            </Typography>
            <ToggleButtonGroup
              value={intensity}
              exclusive
              onChange={(_, value) => {
                if (value) setIntensity(value);
              }}
              fullWidth
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                "& .MuiToggleButton-root": {
                  borderRadius: "14px !important",
                  py: 1.1,
                  fontWeight: 800,
                  textTransform: "none",
                  borderColor: "rgba(255,255,255,0.12)",
                },
              }}
            >
              <ToggleButton value="low">Low</ToggleButton>
              <ToggleButton value="normal">Normal</ToggleButton>
              <ToggleButton value="high">High</ToggleButton>
            </ToggleButtonGroup>
            <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
              Low tasks use lighter CPU and RAM, high tasks use heavier CPU and
              RAM.
            </Typography>
          </Stack>

          <Stack spacing={0.6} sx={{ mt: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>
              Preview per task (approx)
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
              CPU: {preview.cpuMin} - {preview.cpuMax} cores • RAM:{" "}
              {preview.ramMin} - {preview.ramMax} GB • Exec: {preview.execMin} -{" "}
              {preview.execMax} s
            </Typography>
            {error && (
              <Typography sx={{ color: "error.main" }}>{error}</Typography>
            )}
            <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
              Please stay within the 1 to {MAX_TASK_SEED_COUNT} task limit.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSeed}
              disabled={
                `Seeding ${count} tasks...` === "Seeding 0 tasks..." || loading
              }
              loading={loading}
              fullWidth
            >
              Seed
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
