import React from "react";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";

const ConceptsReviewSection = () => {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          spacing={3}
          alignItems="center"
          textAlign="center"
          sx={{ mb: 7 }}
        >
          <Chip
            label="Core Concepts"
            sx={{
              background: "rgba(255, 255, 255, .1)",
              py: 4,
              borderRadius: 2,
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2.3rem", md: "4rem" },
              maxWidth: 820,
            }}
          >
            Learn the concepts that power the simulator.
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 720,
              fontSize: { xs: "1rem", md: "1.12rem" },
              lineHeight: 1.8,
            }}
          >
            Every interaction is built around real systems concepts used in
            operating systems, cloud computing, and distributed resource
            management.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {[
            {
              icon: <AccountTreeRoundedIcon />,
              title: "Priority Scheduling",
              desc: "Important tasks are processed first, while equal-priority tasks follow queue order.",
            },
            {
              icon: <BalanceRoundedIcon />,
              title: "Load Balancing",
              desc: "Work is assigned to the least loaded available server to avoid uneven resource pressure.",
            },
            {
              icon: <SecurityRoundedIcon />,
              title: "Banker’s Algorithm",
              desc: "Before allocation, the simulator checks whether the system remains in a safe state.",
            },
            {
              icon: <SensorsRoundedIcon />,
              title: "Real-Time Updates",
              desc: "Socket events keep the interface synced as tasks move through the system.",
            },
          ].map((concept) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={concept.title}>
              <Box
                sx={{
                  height: "100%",
                  p: 3,
                  borderRadius: "28px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.07)",
                  transition:
                    "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    borderColor: "rgba(168,85,247,0.34)",
                    boxShadow: "0 28px 80px rgba(0,0,0,0.42)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "18px",
                    display: "grid",
                    placeItems: "center",
                    mb: 2.5,
                    color: "primary.main",
                    background: "rgba(76,201,240,0.1)",
                    border: "1px solid rgba(76,201,240,0.18)",
                    "& svg": {
                      fontSize: 28,
                    },
                  }}
                >
                  {concept.icon}
                </Box>

                <Typography variant="h5" sx={{ mb: 1.4 }}>
                  {concept.title}
                </Typography>

                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {concept.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Stack alignItems="center" sx={{ mt: 6 }}>
          <Button
            component={NavLink}
            to="/learn"
            variant="outlined"
            size="large"
            startIcon={<SchoolRoundedIcon />}
          >
            Open Learn Page
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default ConceptsReviewSection;
