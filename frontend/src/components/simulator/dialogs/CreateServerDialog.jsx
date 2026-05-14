// components/simulator/dialogs/CreateServerDialog.jsx
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useViewMode } from "../../../context/ViewModeContext";
import { useSimulator } from "../../../context/SimulatorContext";

function CreateServerDialog({ open, onClose }) {
  const { isKitchen } = useViewMode();
  const { addServer } = useSimulator();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    totalCPU: "",
    totalRAM: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.totalCPU || !form.totalRAM) return;

    try {
      setSubmitting(true);

      await addServer({
        name: form.name.trim(),
        totalCPU: Number(form.totalCPU),
        totalRAM: Number(form.totalRAM),
      });

      setForm({
        name: "",
        totalCPU: "",
        totalRAM: "",
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "28px",
          background:
            "linear-gradient(180deg, rgba(10,15,28,0.98), rgba(6,11,22,0.96))",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h4">
          {isKitchen ? "Add Chef Station" : "Add Server"}
        </Typography>

        <Typography sx={{ color: "text.secondary", mt: 1 }}>
          {isKitchen
            ? "Add a chef/station that can handle incoming orders."
            : "Add a server that can process incoming tasks."}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.2} sx={{ mt: 1 }}>
          <TextField
            label={isKitchen ? "Chef Station Name" : "Server Name"}
            placeholder={isKitchen ? "Chef Station Delta" : "Server Delta"}
            fullWidth
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={isKitchen ? "Cooking Capacity" : "Total CPU"}
              type="number"
              fullWidth
              value={form.totalCPU}
              onChange={(e) => updateField("totalCPU", e.target.value)}
            />

            <TextField
              label={isKitchen ? "Ingredient Capacity" : "Total RAM"}
              type="number"
              fullWidth
              value={form.totalRAM}
              onChange={(e) => updateField("totalRAM", e.target.value)}
            />
          </Stack>

          <Box
            sx={{
              p: 2,
              borderRadius: 4,
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
              {isKitchen
                ? "This station becomes available for the kitchen manager to assign orders based on capacity and ingredient availability."
                : "This server becomes available for the scheduler to allocate tasks based on CPU and RAM availability."}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="outlined" fullWidth onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={submitting}
            >
              {isKitchen ? "Add Station" : "Add Server"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default CreateServerDialog;
