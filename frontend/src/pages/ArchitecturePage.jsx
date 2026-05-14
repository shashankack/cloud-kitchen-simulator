import { Box, Button, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

import ArchitectureConceptsSection from "../components/architecture/ArchitectureConceptsSection";

import HubRoundedIcon from "@mui/icons-material/HubRounded";
import WebRoundedIcon from "@mui/icons-material/WebRounded";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

const stackLayers = [
  {
    icon: <WebRoundedIcon />,
    title: "Frontend",
    detail:
      "React, MUI, and context providers render the dashboard, switch view mode, and keep the simulator responsive.",
  },
  {
    icon: <DnsRoundedIcon />,
    title: "Backend API",
    detail:
      "Express handles room creation, task and server actions, scheduling triggers, retries, and resets.",
  },
  {
    icon: <StorageRoundedIcon />,
    title: "Database",
    detail:
      "MongoDB stores rooms, tasks, servers, and lifecycle logs so the UI can be rebuilt after reconnects.",
  },
  {
    icon: <SensorsRoundedIcon />,
    title: "Realtime Layer",
    detail:
      "Socket.IO pushes room-scoped updates so the active room stays synchronized across clients.",
  },
];

const flowSteps = [
  {
    step: "01",
    title: "Create or join a room",
    detail:
      "The room becomes the session boundary for HTTP validation and socket connection state.",
  },
  {
    step: "02",
    title: "Fetch current simulator state",
    detail:
      "The frontend loads tasks, servers, and logs, then subscribes to socket events for live updates.",
  },
  {
    step: "03",
    title: "Schedule work",
    detail:
      "The backend sorts waiting tasks, tests server fit, runs safety logic, and allocates safe work.",
  },
  {
    step: "04",
    title: "Persist and broadcast",
    detail:
      "State changes are saved to MongoDB and emitted back to the room so every client sees the same truth.",
  },
];

const contractItems = [
  {
    title: "REST control surface",
    detail:
      "Tasks, servers, rooms, and scheduling endpoints let the UI seed data, retry work, and trigger decisions.",
  },
  {
    title: "Realtime event stream",
    detail:
      "Created, updated, seeded, and reset events keep the simulator live without manual refresh.",
  },
  {
    title: "Operational safeguards",
    detail:
      "Autoscaling, watchdog reconciliation, and cleanup keep the simulator stable under timing gaps.",
  },
];

function ArchitecturePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        py: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at top left, rgba(34,197,94,0.14), transparent 28%), radial-gradient(circle at bottom right, rgba(76,201,240,0.12), transparent 26%)",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          <Box
            sx={{
              p: { xs: 3, md: 4.5 },
              borderRadius: { xs: "28px", md: "36px" },
              background:
                "linear-gradient(180deg, rgba(9,13,22,0.96), rgba(8,12,20,0.84))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.32)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top right, rgba(34,197,94,0.16), transparent 30%), radial-gradient(circle at center left, rgba(76,201,240,0.1), transparent 28%)",
                pointerEvents: "none",
              }}
            />

            <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
              <Chip
                icon={<HubRoundedIcon />}
                label="System Architecture"
                sx={{
                  width: "fit-content",
                  color: "#86efac",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.22)",
                  fontWeight: 800,
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  maxWidth: 980,
                  fontSize: {
                    xs: "2.9rem",
                    sm: "4.1rem",
                    md: "5.2rem",
                    lg: "5.9rem",
                  },
                  lineHeight: 0.95,
                  letterSpacing: "-0.06em",
                }}
              >
                One simulator, four layers, one shared truth.
              </Typography>

              <Typography
                sx={{
                  maxWidth: 880,
                  color: "text.secondary",
                  fontSize: { xs: "1rem", md: "1.15rem" },
                  lineHeight: 1.85,
                }}
              >
                The Cloud Kitchen Simulator connects a React frontend, an Express
                backend, MongoDB persistence, and Socket.IO realtime events into
                a single learning system. This page shows how the pieces fit,
                how state moves, and why the app stays synchronized.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ pt: 0.5 }}
              >
                <Button
                  component={NavLink}
                  to="/learn"
                  variant="contained"
                  size="large"
                  startIcon={<TimelineRoundedIcon />}
                  sx={{ borderRadius: "999px", px: 2.5, fontWeight: 900 }}
                >
                  Open Learn
                </Button>

                <Button
                  component={NavLink}
                  to="/rooms"
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrowRoundedIcon />}
                  sx={{
                    borderRadius: "999px",
                    px: 2.5,
                    fontWeight: 900,
                    borderColor: "rgba(255,255,255,0.16)",
                  }}
                >
                  Launch simulator
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Grid container spacing={2.5}>
            {stackLayers.map((layer) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={layer.title}>
                <Box
                  sx={{
                    height: "100%",
                    p: 2.4,
                    borderRadius: "26px",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 18px 56px rgba(0,0,0,0.18)",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "16px",
                        display: "grid",
                        placeItems: "center",
                        color: "#86efac",
                        background: "rgba(34,197,94,0.1)",
                      }}
                    >
                      {layer.icon}
                    </Box>

                    <Typography variant="h6">{layer.title}</Typography>

                    <Typography
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.7,
                        fontSize: "0.95rem",
                      }}
                    >
                      {layer.detail}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: "32px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Stack spacing={2.5}>
                  <Stack spacing={1}>
                    <Chip
                      label="Request / State Flow"
                      sx={{
                        width: "fit-content",
                        color: "primary.main",
                        background: "rgba(76,201,240,0.1)",
                        border: "1px solid rgba(76,201,240,0.2)",
                        fontWeight: 800,
                      }}
                    />

                    <Typography variant="h3">
                      How the simulator moves work from input to updated UI
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    {flowSteps.map((step) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={step.step}>
                        <Box
                          sx={{
                            height: "100%",
                            p: 2.2,
                            borderRadius: "24px",
                            background: "rgba(255,255,255,0.035)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <Stack spacing={1.1}>
                            <Typography
                              sx={{
                                color: "#86efac",
                                fontWeight: 900,
                                fontSize: "0.85rem",
                              }}
                            >
                              {step.step}
                            </Typography>

                            <Typography sx={{ fontWeight: 900 }}>
                              {step.title}
                            </Typography>

                            <Typography
                              sx={{
                                color: "text.secondary",
                                lineHeight: 1.65,
                                fontSize: "0.94rem",
                              }}
                            >
                              {step.detail}
                            </Typography>
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  height: "100%",
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: "32px",
                  background:
                    "radial-gradient(circle at top, rgba(34,197,94,0.14), transparent 36%), linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Stack spacing={2.5}>
                  <Stack spacing={1}>
                    <Chip
                      label="Contract and runtime"
                      sx={{
                        width: "fit-content",
                        color: "#86efac",
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        fontWeight: 800,
                      }}
                    />

                    <Typography variant="h3">
                      The contract the UI and backend agree on
                    </Typography>
                  </Stack>

                  <Stack spacing={1.4}>
                    {contractItems.map((item) => (
                      <Box
                        key={item.title}
                        sx={{
                          p: 2,
                          borderRadius: "22px",
                          background: "rgba(255,255,255,0.035)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, mb: 0.5 }}>
                          {item.title}
                        </Typography>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            lineHeight: 1.65,
                            fontSize: "0.94rem",
                          }}
                        >
                          {item.detail}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          </Grid>

          <ArchitectureConceptsSection />

          <Box
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: "32px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Stack spacing={2}>
              <Chip
                label="Operational notes"
                sx={{
                  width: "fit-content",
                  color: "primary.main",
                  background: "rgba(76,201,240,0.1)",
                  border: "1px solid rgba(76,201,240,0.2)",
                  fontWeight: 800,
                }}
              />

              <Typography variant="h3">Why this architecture works well</Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  maxWidth: 1040,
                  lineHeight: 1.8,
                }}
              >
                The design keeps the simulator understandable: the frontend owns
                presentation and local state, the backend owns scheduling and
                persistence, MongoDB stores durable records, and Socket.IO keeps
                the active room synchronized. That separation is simple enough to
                explain in class, but still close to how real systems are built.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default ArchitecturePage;
