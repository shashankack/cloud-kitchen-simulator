import React from "react";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import PlasmaWave from "../../components/common/PlasmaWave";

import { useViewMode } from "../../context/ViewModeContext";

const MotionBox = motion.create(Box);

const HeroSection = () => {
  const { isKitchen } = useViewMode();

  return (
    <Box
      component="section"
      sx={{
        minHeight: "calc(100vh - 76px)",
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.8,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <PlasmaWave
          colors={["#A855F7", "#3b82f6"]}
          speed1={0.04}
          speed2={0.03}
          focalLength={0.9}
          bend1={1}
          bend2={0.6}
          dir2={1}
          rotationDeg={-12}
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
              radial-gradient(circle at center, transparent 0%, rgba(2,5,13,0.2) 45%, rgba(2,5,13,0.92) 100%)
            `,
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            minHeight: "calc(100vh - 76px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Stack
              spacing={4}
              sx={{
                alignItems: "center",
                justifyContent: "center",
                maxWidth: 950,
              }}
            >
              <Chip
                icon={<AutoAwesomeRoundedIcon />}
                label={
                  isKitchen
                    ? "Interactive kitchen systems simulator"
                    : "Interactive distributed systems simulator"
                }
                sx={{
                  width: "fit-content",
                  px: 1,
                  py: 2.5,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  maxWidth: 950,
                  fontSize: {
                    xs: "3.1rem",
                    sm: "4.2rem",
                    md: "5.4rem",
                    lg: "6.2rem",
                  },
                }}
              >
                Simulate. Schedule. Understand.
              </Typography>

              <Typography
                sx={{
                  maxWidth: 720,
                  color: "text.secondary",
                  fontSize: {
                    xs: "1rem",
                    md: "1.22rem",
                  },
                  lineHeight: 1.85,
                  mx: "auto",
                }}
              >
                {isKitchen
                  ? "A gamified kitchen simulator where orders, chefs, capacity, and ingredients help explain real scheduling logic."
                  : "A gamified systems simulator where tasks, servers, CPU, RAM, and safety checks come alive visually."}
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
                >
                  Launch Simulator
                </Button>

                <Button
                  component={NavLink}
                  to="/learn"
                  variant="outlined"
                  size="large"
                  startIcon={<SchoolRoundedIcon />}
                >
                  Learn Concepts
                </Button>
              </Stack>
            </Stack>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
