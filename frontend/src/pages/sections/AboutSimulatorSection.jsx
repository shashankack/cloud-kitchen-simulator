import React from "react";
import { Box, Container, Grid, Stack, Typography, Chip } from "@mui/material";

const AboutSimulatorSection = () => {
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
            sx={{
              background: "rgba(255, 255, 255, .2)",
              py: 4,
              borderRadius: 4,
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
            label="Dual Context Learning"
          />

          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2.3rem", md: "4rem" },
              maxWidth: 820,
            }}
          >
            One simulation engine. Two ways to understand it.
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 720,
              fontSize: { xs: "1rem", md: "1.12rem" },
              lineHeight: 1.8,
            }}
          >
            Switch between a technical cloud system and a restaurant kitchen
            analogy without changing the underlying logic.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {[
            {
              title: "Technical Mode",
              desc: "Understand tasks, servers, CPU, RAM, queues, and scheduler decisions.",
              pairs: [
                ["Task", "Work unit"],
                ["Server", "Processing machine"],
                ["CPU", "Compute capacity"],
                ["RAM", "Memory resource"],
              ],
            },
            {
              title: "Kitchen Mode",
              desc: "Understand the same concepts using orders, chefs, ingredients, and kitchen load.",
              pairs: [
                ["Order", "Work unit"],
                ["Chef", "Processing machine"],
                ["Cooking Capacity", "Compute capacity"],
                ["Ingredients", "Memory resource"],
              ],
            },
          ].map((card) => (
            <Grid size={{ xs: 12, md: 6 }} key={card.title}>
              <Box
                sx={{
                  height: "100%",
                  p: { xs: 3, md: 4 },
                  borderRadius: "32px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  transition:
                    "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    borderColor: "rgba(168,85,247,0.32)",
                    boxShadow: "0 30px 90px rgba(0,0,0,0.45)",
                  },
                }}
              >
                <Typography variant="h4">{card.title}</Typography>

                <Typography sx={{ color: "text.secondary", mt: 1.5, mb: 3 }}>
                  {card.desc}
                </Typography>

                <Stack spacing={1.3}>
                  {card.pairs.map(([left, right]) => (
                    <Box
                      key={left}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        p: 2,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 800 }}>{left}</Typography>
                      <Typography sx={{ color: "text.secondary" }}>
                        {right}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutSimulatorSection;
