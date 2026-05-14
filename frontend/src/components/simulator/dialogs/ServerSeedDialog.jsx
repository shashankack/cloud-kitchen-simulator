import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useSimulator } from "../../../context/SimulatorContext";

export default function ServerSeedDialog({ open, onClose }) {
  const { seedServersForRoomCount } = useSimulator();
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    try {
      await seedServersForRoomCount(count);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to seed servers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Seed Servers</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography sx={{ color: "text.secondary" }}>
            How many servers would you like to create? (backend supports
            variable count)
          </Typography>
          <TextField
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            fullWidth
            disabled={loading}
          />
          {error && (
            <Typography sx={{ color: "error.main", fontSize: "0.875rem" }}>
              {error}
            </Typography>
          )}
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={onClose} fullWidth disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSeed}
              fullWidth
              disabled={loading}
            >
              {loading ? "Seeding..." : "Seed"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
