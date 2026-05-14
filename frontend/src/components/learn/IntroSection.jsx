import { Box, Button, Chip, Grid, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";

import { useViewMode } from "../../context/ViewModeContext";

function IntroSection() {
  const { isKitchen } = useViewMode();

  const highlights = [
    {
      icon: <AccountTreeRoundedIcon />,
      title: isKitchen
        ? "Learn through kitchen flow"
        : "Learn through system flow",
      detail: isKitchen
        ? "Orders, stations, capacity, and ingredients explain the same logic in a familiar way."
        : "Tasks, servers, CPU, and RAM show how scheduling decisions work.",
    },
    {
      icon: <PsychologyRoundedIcon />,
      title: "Understand the decision-making",
      detail:
        "See why work runs, waits, fails, retries, or gets blocked by resource limits.",
    },
    {
      icon: <SyncRoundedIcon />,
      title: "Connect concepts to simulation",
      detail:
        "Every lesson maps back to what you see in the simulator graph and queue panels.",
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at top left, rgba(76,201,240,0.16), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2.2}>
            <Chip
              icon={<SchoolRoundedIcon />}
              label="Interactive Learning Mode"
              sx={{
                width: "fit-content",
                color: "primary.main",
                background: "rgba(76,201,240,0.1)",
                border: "1px solid rgba(76,201,240,0.22)",
                fontWeight: 800,
              }}
            />

            <Typography
              variant="h2"
              sx={{
                maxWidth: 820,
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              {isKitchen
                ? "Understand distributed systems through a working kitchen."
                : "Understand distributed systems through a live simulator."}
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                lineHeight: 1.8,
                maxWidth: 760,
                fontSize: { xs: "1rem", md: "1.08rem" },
              }}
            >
              {isKitchen
                ? "This page explains how orders move, how chef stations are selected, why capacity matters, and what happens when the kitchen gets overloaded or something fails."
                : "This page explains how tasks move, how servers are selected, why resource allocation matters, and what happens when the system gets overloaded or something fails."}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                component="a"
                onClick={() =>
                  window.scrollTo({ top: 500, behavior: "smooth" })
                }
                variant="contained"
                startIcon={<PlayArrowRoundedIcon />}
                sx={{
                  width: { xs: "100%", sm: "fit-content" },
                  borderRadius: "999px",
                  px: 2.4,
                  py: 1.1,
                  fontWeight: 900,
                }}
              >
                Start learning
              </Button>

              <Button
                component={NavLink}
                to="/rooms"
                variant="outlined"
                sx={{
                  width: { xs: "100%", sm: "fit-content" },
                  borderRadius: "999px",
                  px: 2.4,
                  py: 1.1,
                  fontWeight: 900,
                  borderColor: "rgba(255,255,255,0.16)",
                }}
              >
                Open simulator
              </Button>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={1.5}>
            {highlights.map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: 2,
                  borderRadius: "22px",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "15px",
                      display: "grid",
                      placeItems: "center",
                      color: "primary.main",
                      background: "rgba(76,201,240,0.1)",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 900 }}>
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "text.secondary",
                        mt: 0.5,
                        lineHeight: 1.65,
                        fontSize: "0.92rem",
                      }}
                    >
                      {item.detail}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default IntroSection;
