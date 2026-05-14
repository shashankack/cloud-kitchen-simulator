import React from "react";
import { Box, Container, Grid, Stack, Typography, Chip } from "@mui/material";
import { useViewMode } from "../../context/ViewModeContext";

const HowItWorksSection = () => {
  const { isKitchen } = useViewMode();
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
            label="Simulation Flow"
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
            Watch every decision happen step by step.
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 720,
              fontSize: { xs: "1rem", md: "1.12rem" },
              lineHeight: 1.8,
            }}
          >
            The simulator shows how work moves from queue to allocation, then
            into execution and completion.
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          {[
            {
              step: "01",
              title: isKitchen ? "Create Order" : "Create Task",
              desc: isKitchen
                ? "Add an order with required cooking capacity, ingredients, and priority."
                : "Add a task with CPU, RAM, execution time, and priority.",
            },
            {
              step: "02",
              title: "Enter Queue",
              desc: isKitchen
                ? "Orders wait in line until the kitchen manager starts assigning them."
                : "Tasks wait in the queue until the scheduler starts processing.",
            },
            {
              step: "03",
              title: "Priority Sort",
              desc: isKitchen
                ? "High-priority orders move ahead of normal orders."
                : "High-priority tasks are selected before lower-priority tasks.",
            },
            {
              step: "04",
              title: isKitchen ? "Chef Selection" : "Server Selection",
              desc: isKitchen
                ? "The least busy chef with enough capacity is selected."
                : "The least loaded server with enough resources is selected.",
            },
            {
              step: "05",
              title: "Safety Check",
              desc: isKitchen
                ? "The system checks whether accepting the order will overload the kitchen."
                : "Banker’s Algorithm checks whether allocation keeps the system safe.",
            },
            {
              step: "06",
              title: isKitchen ? "Cooking Begins" : "Execution Begins",
              desc: isKitchen
                ? "The order starts cooking and chef resources are temporarily occupied."
                : "The task starts running and server resources are temporarily consumed.",
            },
          ].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.step}>
              <Box
                sx={{
                  height: "100%",
                  p: 3,
                  borderRadius: "28px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.07)",
                  transition:
                    "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    borderColor: "rgba(76,201,240,0.28)",
                    boxShadow: "0 28px 80px rgba(0,0,0,0.42)",
                  },
                }}
              >
                <Typography
                  sx={{
                    mb: 2,
                    fontWeight: 900,
                    color: "primary.main",
                    fontSize: "0.85rem",
                    letterSpacing: "0.12em",
                  }}
                >
                  STEP {item.step}
                </Typography>

                <Typography variant="h5" sx={{ mb: 1.5 }}>
                  {item.title}
                </Typography>

                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
