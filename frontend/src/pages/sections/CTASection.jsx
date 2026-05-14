import React from "react";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PlasmaWave from "../../components/common/PlasmaWave";

const CTASection = () => {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 12, md: 13 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "40px",
            px: { xs: 4, md: 8 },
            py: { xs: 6, md: 4 },
            background: `
          radial-gradient(circle at top left, rgba(168,85,247,0.16), transparent 28%),
          radial-gradient(circle at bottom right, rgba(59,130,246,0.16), transparent 30%),
          linear-gradient(
            180deg,
            rgba(255,255,255,0.05),
            rgba(255,255,255,0.02)
          )
        `,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
            backdropFilter: "blur(18px)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -120,
              right: -120,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "rgba(168,85,247,0.12)",
              filter: "blur(80px)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              bottom: -140,
              left: -100,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(59,130,246,0.12)",
              filter: "blur(100px)",
            }}
          />

          <Stack
            spacing={4}
            alignItems="center"
            textAlign="center"
            sx={{
              position: "relative",
              zIndex: 2,
            }}
          >
            <Chip
              label="Interactive Systems Playground"
              sx={{
                background: "rgba(255, 255, 255, .2)",
                py: 4,
                borderRadius: 4,
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            />

            <Typography
              variant="h2"
              sx={{
                maxWidth: 850,
                fontSize: {
                  xs: "2.6rem",
                  md: "3.8rem",
                },
              }}
            >
              Stop reading about systems.
              <br />
              Start interacting with them.
            </Typography>

            <Typography
              sx={{
                maxWidth: 700,
                color: "text.secondary",
                fontSize: {
                  xs: "1rem",
                  md: "1.15rem",
                },
                lineHeight: 1.9,
              }}
            >
              Simulate scheduling, visualize allocation decisions, understand
              system safety, and explore how distributed resource management
              actually works.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Button
                component={NavLink}
                to="/rooms"
                variant="contained"
                size="large"
                startIcon={<PlayArrowRoundedIcon />}
                sx={{
                  minWidth: 220,
                }}
              >
                Launch Simulator
              </Button>

              <Button
                component={NavLink}
                to="/learn"
                variant="outlined"
                size="large"
                startIcon={<SchoolRoundedIcon />}
                sx={{
                  minWidth: 220,
                }}
              >
                Explore Concepts
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;
