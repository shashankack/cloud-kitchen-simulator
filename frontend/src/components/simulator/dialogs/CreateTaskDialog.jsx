// components/simulator/dialogs/CreateTaskDialog.jsx
import { useState } from "react";
import { useSimulator } from "../../../context/SimulatorContext";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useViewMode } from "../../../context/ViewModeContext";

function CreateTaskDialog({ open, onClose }) {
  const { isKitchen } = useViewMode();
  const { addTask } = useSimulator();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cpu: "",
    ram: "",
    priority: 2,
    executionTime: 10,
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.cpu || !form.ram) return;

    try {
      setSubmitting(true);

      await addTask({
        name: form.name.trim(),
        cpu: Number(form.cpu),
        ram: Number(form.ram),
        priority: Number(form.priority),
        executionTime: Number(form.executionTime),
      });

      setForm({
        name: "",
        cpu: "",
        ram: "",
        priority: 2,
        executionTime: 10,
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
          borderRadius: 1,
          background:
            "linear-gradient(180deg, rgba(10,15,28,0.98), rgba(6,11,22,0.96))",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h4">
          {isKitchen ? "Create New Order" : "Create New Task"}
        </Typography>

        <Typography sx={{ color: "text.secondary", mt: 1 }}>
          {isKitchen
            ? "Add a new order into the kitchen queue."
            : "Add a new task into the scheduling queue."}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.2} sx={{ mt: 1 }}>
          <TextField
            label={isKitchen ? "Order Name" : "Task Name"}
            placeholder={isKitchen ? "Paneer Bowl" : "Image Processing"}
            fullWidth
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={isKitchen ? "Cooking Capacity" : "CPU Required"}
              type="number"
              fullWidth
              value={form.cpu}
              onChange={(e) => updateField("cpu", e.target.value)}
            />

            <TextField
              label={isKitchen ? "Ingredients Required" : "RAM Required"}
              type="number"
              fullWidth
              value={form.ram}
              onChange={(e) => updateField("ram", e.target.value)}
            />
          </Stack>

          <TextField
            label="Priority"
            select
            defaultValue={2}
            fullWidth
            value={form.priority}
            onChange={(e) => updateField("priority", e.target.value)}
          >
            <MenuItem value={1}>High Priority</MenuItem>
            <MenuItem value={2}>Medium Priority</MenuItem>
            <MenuItem value={3}>Low Priority</MenuItem>
          </TextField>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
              {isKitchen
                ? "This order will enter the queue and wait until the kitchen allocation engine assigns it to an available chef."
                : "This task will enter the queue and wait until the scheduler assigns it to an available server."}
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
              {isKitchen ? "Add Order" : "Add Task"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTaskDialog;
