// components/simulator/SimulatorTopbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
} from "@mui/material";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";

import { useViewMode } from "../../context/ViewModeContext";
import { useRoom } from "../../context/RoomContext";
import { useSimulator } from "../../context/SimulatorContext";

import CreateTaskDialog from "./dialogs/CreateTaskDialog";
import CreateServerDialog from "./dialogs/CreateServerDialog";
import TaskSeedDialog from "./dialogs/TaskSeedDialog";
import ServerSeedDialog from "./dialogs/ServerSeedDialog";

import TaskControlsMenu from "./controls/TaskControlsMenu";
import ServerControlsMenu from "./controls/ServerControlsMenu";
// Scheduler controls moved into canvas; menu removed from topbar

function SimulatorTopbar({
  showBankersView = false,
  onToggleBankersView = () => {},
}) {
  const { isKitchen } = useViewMode();
  const { roomName, clearRoom } = useRoom();
  const { resetTasksForRoom, resetServersForRoom } = useSimulator();
  const { loading } = useSimulator();
  const navigate = useNavigate();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [serverDialogOpen, setServerDialogOpen] = useState(false);
  const [taskSeedOpen, setTaskSeedOpen] = useState(false);
  const [serverSeedOpen, setServerSeedOpen] = useState(false);

  const handleLeaveRoom = () => {
    clearRoom();
    navigate("/rooms");
  };

  const handleResetTasks = () => {
    if (
      window.confirm(
        isKitchen
          ? "Are you sure you want to reset all orders?"
          : "Are you sure you want to reset all tasks?",
      )
    ) {
      resetTasksForRoom();
    }
  };

  const handleResetServers = () => {
    if (
      window.confirm(
        isKitchen
          ? "Are you sure you want to reset all chef stations?"
          : "Are you sure you want to reset all servers?",
      )
    ) {
      resetServersForRoom();
    }
  };

  return (
    <>
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2.2, md: 2.5 },
          borderRadius: "24px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(14px)",
          width: "100%",
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "flex-start" },
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {!loading ? (
                <>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                      fontSize: { xs: "1.55rem", sm: "1.9rem", md: "2.1rem" },
                    }}
                  >
                    {isKitchen
                      ? "Kitchen Operations Simulator"
                      : "Distributed Systems Simulator"}
                  </Typography>

                  {roomName && (
                    <Typography
                      sx={{
                        mt: 0.6,
                        color: "primary.main",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                      }}
                    >
                      {isKitchen ? "Kitchen" : "Room"}: {roomName}
                    </Typography>
                  )}

                  <Typography
                    sx={{
                      mt: 0.8,
                      color: "text.secondary",
                      fontSize: { xs: "0.9rem", md: "0.96rem" },
                      maxWidth: 680,
                      lineHeight: 1.65,
                    }}
                  >
                    {isKitchen
                      ? "Simulate order flow, chef allocation, kitchen load, and scheduling behavior in real time."
                      : "Simulate task allocation, server load balancing, scheduling behavior, and safe-state execution in real time."}
                  </Typography>
                </>
              ) : (
                <>
                  <Skeleton width={320} height={36} />
                  <Skeleton width={140} height={20} sx={{ mt: 1 }} />
                  <Skeleton width="60%" height={18} sx={{ mt: 1 }} />
                </>
              )}
            </Box>

            <Button
              variant="outlined"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleLeaveRoom}
              sx={{
                flexShrink: 0,
                minWidth: { xs: "100%", sm: 150 },
                alignSelf: { xs: "stretch", md: "flex-start" },
              }}
            >
              {isKitchen ? "Leave Kitchen" : "Leave Room"}
            </Button>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{
              width: "100%",
              alignItems: { xs: "stretch", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <ToggleButtonGroup
              value={showBankersView ? "bankers" : "simulation"}
              exclusive
              onChange={(e, newView) => {
                if (newView !== null) onToggleBankersView();
              }}
              sx={{
                height: { xs: "auto", sm: 44 },
                width: { xs: "100%", md: "auto" },
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",

                "& .MuiToggleButtonGroup-grouped": {
                  margin: 0,
                  border: "0 !important",
                },

                "& .MuiToggleButton-root": {
                  minHeight: 44,
                  px: { xs: 1.2, sm: 1.6 },
                  py: 1,
                  color: "text.secondary",
                  border: "none",
                  borderRadius: "0 !important",
                  fontSize: { xs: "0.76rem", sm: "0.82rem" },
                  fontWeight: 800,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  transition: "background 180ms ease, color 180ms ease",
                  justifyContent: "center",

                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                  },

                  "&.Mui-selected": {
                    color: "primary.main",
                    background: "rgba(76,201,240,0.15)",

                    "&:hover": {
                      background: "rgba(76,201,240,0.2)",
                    },
                  },
                },
              }}
            >
              <ToggleButton value="simulation" aria-label="simulation view">
                <AccountTreeRoundedIcon sx={{ mr: 0.8, fontSize: "1.05rem" }} />
                {isKitchen ? "Order Flow" : "Task Flow"}
              </ToggleButton>

              <ToggleButton value="bankers" aria-label="bankers view">
                <HubRoundedIcon sx={{ mr: 0.8, fontSize: "1.05rem" }} />
                {isKitchen ? "Chef Load" : "Resources"}
              </ToggleButton>
            </ToggleButtonGroup>

            <Stack
              direction={{ xs: "row", sm: "row" }}
              spacing={1.2}
              sx={{
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "stretch", md: "flex-end" },
                "& > *": {
                  flex: { xs: "1 1 auto", sm: "0 0 auto" },
                },
              }}
            >
              <TaskControlsMenu
                onCreateTask={() => setTaskDialogOpen(true)}
                onSeedTasks={() => setTaskSeedOpen(true)}
                onResetTasks={handleResetTasks}
              />

              <ServerControlsMenu
                onCreateServer={() => setServerDialogOpen(true)}
                onSeedServers={() => setServerSeedOpen(true)}
                onResetServers={handleResetServers}
              />
            </Stack>
          </Stack>
        </Stack>

        <CreateTaskDialog
          open={taskDialogOpen}
          onClose={() => setTaskDialogOpen(false)}
        />
        <CreateServerDialog
          open={serverDialogOpen}
          onClose={() => setServerDialogOpen(false)}
        />
        <TaskSeedDialog
          open={taskSeedOpen}
          onClose={() => setTaskSeedOpen(false)}
        />
        <ServerSeedDialog
          open={serverSeedOpen}
          onClose={() => setServerSeedOpen(false)}
        />
      </Box>
    </>
  );
}

export default SimulatorTopbar;
