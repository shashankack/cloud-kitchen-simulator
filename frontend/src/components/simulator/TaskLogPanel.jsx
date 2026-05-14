import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { useViewMode } from "../../context/ViewModeContext";
import { useSimulator } from "../../context/SimulatorContext";

function formatWhen(value) {
  if (!value) return "unknown time";
  try {
    return new Date(value).toLocaleTimeString();
  } catch {
    return "unknown time";
  }
}

function statusColor(status) {
  if (status === "completed") return "success";
  if (status === "failed") return "error";
  return "default";
}

function TaskLogPanel() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(true);
  const { isKitchen } = useViewMode();
  const { taskLogs = [], clearTaskLogsForRoom } = useSimulator();
  const [clearingLogs, setClearingLogs] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const drawerWidth = 340;
  const collapsedWidth = 24;

  const headerText = useMemo(
    () => (isKitchen ? "Kitchen Activity Log" : "Task Activity Log"),
    [isKitchen],
  );

  const handleClearLogs = async () => {
    if (clearingLogs) return;
    setClearingLogs(true);
    try {
      await clearTaskLogsForRoom();
    } finally {
      setClearingLogs(false);
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        p: 2.5,
        mt: 4,
        background:
          "linear-gradient(180deg, rgba(10,14,24,0.98), rgba(10,14,24,0.94))",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        overflowY: "auto",
      }}
    >
      <Stack spacing={2.2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Chip
              icon={<HistoryRoundedIcon />}
              label={`${taskLogs.length} entries`}
              sx={{
                color: "primary.main",
                background: "rgba(76,201,240,0.1)",
                border: "1px solid rgba(76,201,240,0.22)",
                fontWeight: 900,
              }}
            />

            <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 900 }}>
              {headerText}
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                mt: 0.7,
                lineHeight: 1.6,
                fontSize: "0.9rem",
              }}
            >
              {isKitchen
                ? "Recent order outcomes with station and timing details."
                : "Recent task outcomes with server and timing details."}
            </Typography>

            <Button
              onClick={handleClearLogs}
              disabled={taskLogs.length === 0 || clearingLogs}
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<DeleteForeverRoundedIcon />}
              sx={{ mt: 1.6 }}
            >
              {clearingLogs ? "Clearing..." : "Clear logs"}
            </Button>
          </Box>

          {!isDesktop && (
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          )}
        </Stack>

        <Stack spacing={1.2}>
          {taskLogs.length === 0 ? (
            <Typography sx={{ color: "text.secondary", fontSize: "0.92rem" }}>
              No activity yet. Complete or fail a task to start logging.
            </Typography>
          ) : (
            taskLogs.map((log) => (
              <Box
                key={log._id}
                sx={{
                  p: 1.2,
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    {log.taskName || "Unnamed Task"}
                  </Typography>
                  <Chip
                    size="small"
                    color={statusColor(log.status)}
                    label={(log.status || "unknown").toUpperCase()}
                    sx={{ fontWeight: 700, height: 22 }}
                  />
                </Stack>

                <Typography sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 0.5 }}>
                  {isKitchen ? "Station" : "Server"}: {log.serverName || "Unassigned"} | CPU: {log.cpu ?? 0} | RAM: {log.ram ?? 0}
                </Typography>

                <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", mt: 0.2 }}>
                  Exec: {log.executionTime ?? 0}s | Wait: {Number(log.waitTime || 0).toFixed(1)}s | {formatWhen(log.createdAt)}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <>
      {/* Desktop open button for overlay drawer */}
      {isDesktop && (
        <IconButton
          onClick={() => setDrawerCollapsed((v) => !v)}
          sx={{
            position: "fixed",
            top: 96,
            right: 16,
            zIndex: 40,
            width: 48,
            height: 48,
            borderRadius: "999px",
            color: "primary.main",
            background: "rgba(10,14,24,0.96)",
            border: "1px solid rgba(76,201,240,0.28)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            "&:hover": {
              background: "rgba(76,201,240,0.14)",
            },
          }}
        >
          {drawerCollapsed ? <MenuRoundedIcon /> : <CloseRoundedIcon />}
        </IconButton>
      )}

      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileOpen || !drawerCollapsed}
        onClose={() => {
          setMobileOpen(false);
          setDrawerCollapsed(true);
        }}
        ModalProps={{ keepMounted: true }}
        sx={{
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "transparent",
            border: "none",
            height: "100vh",
            overflow: "visible",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: "100%",
            width: "100%",
          }}
        >
          {!drawerCollapsed || mobileOpen ? drawerContent : null}
        </Box>
      </Drawer>

      {!isDesktop && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 96,
            right: 16,
            zIndex: 30,
            width: 48,
            height: 48,
            borderRadius: "999px",
            color: "primary.main",
            background: "rgba(10,14,24,0.96)",
            border: "1px solid rgba(76,201,240,0.28)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            "&:hover": {
              background: "rgba(76,201,240,0.14)",
            },
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
      )}
    </>
  );
}

export default TaskLogPanel;
