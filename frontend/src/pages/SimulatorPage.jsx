import { Alert, Box, Container, Grid, Snackbar, Stack } from "@mui/material";
import { Suspense, lazy, useState } from "react";

import SimulatorTopbar from "../components/simulator/SimulatorTopbar";
import QueuePanel from "../components/simulator/QueuePanel";
const SimulationCanvas = lazy(
  () => import("../components/simulator/SimulationCanvas"),
);
const BankersAlgorithmCanvas = lazy(
  () => import("../components/simulator/BankersAlgorithmCanvas"),
);
import ServerGrid from "../components/simulator/ServerGrid";
import StatsBar from "../components/simulator/StatsBar";
import TaskLogPanel from "../components/simulator/TaskLogPanel";
import RoomSetupDialog from "../components/simulator/dialogs/RoomSetupDialog";

import { useRoom } from "../context/RoomContext";
import { useSimulator } from "../context/SimulatorContext";

function SimulatorPage() {
  const { hasRoom } = useRoom();
  const { tasks = [], servers = [], autoScaledCleanupMessage } = useSimulator();
  const [showBankersView, setShowBankersView] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack spacing={3}>
              <SimulatorTopbar
                showBankersView={showBankersView}
                onToggleBankersView={() => setShowBankersView(!showBankersView)}
              />

              <StatsBar />

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 3 }}>
                  <QueuePanel />
                </Grid>

                <Grid size={{ xs: 12, lg: 8.8 }}>
                  <Suspense
                    fallback={
                      <Box sx={{ minHeight: 660, borderRadius: 4, p: 3 }}>
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              height: 36,
                              width: "40%",
                              bgcolor: "rgba(255,255,255,0.08)",
                              borderRadius: 1,
                            }}
                          />
                          <Box
                            sx={{
                              height: 280,
                              bgcolor: "rgba(255,255,255,0.05)",
                              borderRadius: 3,
                            }}
                          />
                          <Box
                            sx={{
                              height: 240,
                              bgcolor: "rgba(255,255,255,0.04)",
                              borderRadius: 3,
                            }}
                          />
                        </Stack>
                      </Box>
                    }
                  >
                    {showBankersView ? (
                      <BankersAlgorithmCanvas tasks={tasks} servers={servers} />
                    ) : (
                      <SimulationCanvas />
                    )}
                  </Suspense>
                </Grid>
              </Grid>

              <ServerGrid />
            </Stack>
          </Box>

          <TaskLogPanel />
        </Box>
      </Container>
      <RoomSetupDialog open={!hasRoom} />

      <Snackbar
        open={Boolean(autoScaledCleanupMessage)}
        autoHideDuration={4000}
        onClose={() => {}}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 1 }}>
          {autoScaledCleanupMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SimulatorPage;
