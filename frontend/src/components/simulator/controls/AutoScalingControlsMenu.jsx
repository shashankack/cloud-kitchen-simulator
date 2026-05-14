import { useState } from "react";
import {
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { useSimulator } from "../../../context/SimulatorContext";

function AutoScalingControlsMenu({
  onAddAutoScaledServer = () => {},
  onCleanupIdleServers = () => {},
}) {
  const { addAutoScaledServer, cleanupIdleAutoScaledServers, servers } =
    useSimulator();

  const [anchorEl, setAnchorEl] = useState(null);
  const [addServerDialogOpen, setAddServerDialogOpen] = useState(false);
  const [cpuValue, setCpuValue] = useState("16");
  const [ramValue, setRamValue] = useState("32");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const autoScaledCount = servers.filter((s) => s.isAutoScaled).length;

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddAutoScaled = async () => {
    setBusy(true);
    setError(null);
    try {
      await addAutoScaledServer(parseInt(cpuValue, 10), parseInt(ramValue, 10));
      onAddAutoScaledServer();
      setAddServerDialogOpen(false);
      setCpuValue("16");
      setRamValue("32");
      handleMenuClose();
    } catch (err) {
      setError(err?.message || "Failed to add auto-scaled server");
    } finally {
      setBusy(false);
    }
  };

  const handleCleanupIdle = async () => {
    setBusy(true);
    setError(null);
    try {
      await cleanupIdleAutoScaledServers();
      onCleanupIdleServers();
      handleMenuClose();
    } catch (err) {
      setError(err?.message || "Failed to cleanup idle servers");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        endIcon={<ExpandMoreRoundedIcon />}
        onClick={handleMenuOpen}
        startIcon={<CloudUploadRoundedIcon />}
        fullWidth
        sx={{ minWidth: { sm: 200 } }}
      >
        Auto-Scale
        {autoScaledCount > 0 && (
          <span style={{ marginLeft: "6px", fontWeight: 900 }}>
            ({autoScaledCount})
          </span>
        )}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem
          onClick={() => {
            setAddServerDialogOpen(true);
            handleMenuClose();
          }}
        >
          Add Auto-Scaled Server
        </MenuItem>
        <MenuItem onClick={handleCleanupIdle} disabled={busy || autoScaledCount === 0}>
          Cleanup Idle Servers ({autoScaledCount})
        </MenuItem>
      </Menu>

      <Dialog
        open={addServerDialogOpen}
        onClose={() => setAddServerDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Auto-Scaled Server</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Total CPU"
              type="number"
              value={cpuValue}
              onChange={(e) => setCpuValue(e.target.value)}
              fullWidth
              inputProps={{ min: 1, max: 128 }}
              disabled={busy}
            />
            <TextField
              label="Total RAM"
              type="number"
              value={ramValue}
              onChange={(e) => setRamValue(e.target.value)}
              fullWidth
              inputProps={{ min: 1, max: 256 }}
              disabled={busy}
            />
            {error && (
              <Typography sx={{ color: "error.main", fontSize: "0.875rem" }}>
                {error}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddServerDialogOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleAddAutoScaled} variant="contained" disabled={busy}>
            {busy ? "Adding..." : "Add Server"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AutoScalingControlsMenu;
