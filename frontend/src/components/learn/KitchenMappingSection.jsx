import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";

const mappings = [
  {
    icon: <TaskAltRoundedIcon />,
    technical: "Task",
    kitchen: "Order",
    meaning:
      "A unit of work waiting to be processed by the system.",
  },
  {
    icon: <DnsRoundedIcon />,
    technical: "Server",
    kitchen: "Chef Station",
    meaning:
      "A worker that has limited capacity and can process assigned work.",
  },
  {
    icon: <MemoryRoundedIcon />,
    technical: "CPU",
    kitchen: "Cooking Capacity",
    meaning:
      "The active processing power required to run work.",
  },
  {
    icon: <RestaurantRoundedIcon />,
    technical: "RAM",
    kitchen: "Ingredients",
    meaning:
      "The supporting resource needed while work is being processed.",
  },
  {
    icon: <ManageAccountsRoundedIcon />,
    technical: "Scheduler",
    kitchen: "Kitchen Manager",
    meaning:
      "The decision-maker that chooses what should run next and where.",
  },
];

function KitchenMappingSection() {
  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at top right, rgba(249,115,22,0.14), transparent 34%), rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<CompareArrowsRoundedIcon />}
            label="Dual Context Mapping"
            sx={{
              width: "fit-content",
              color: "#fdba74",
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.22)",
              fontWeight: 800,
            }}
          />

          <Typography variant="h3">
            How kitchen mode teaches the same system differently
          </Typography>

          <Typography
            sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 940 }}
          >
            The simulator does not change its logic between modes. It only
            changes the language. Technical mode explains the system like a
            distributed computing problem. Kitchen mode explains the same system
            through a restaurant workflow.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {mappings.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.technical}>
              <Box
                sx={{
                  height: "100%",
                  p: 2.3,
                  borderRadius: "24px",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: "16px",
                      display: "grid",
                      placeItems: "center",
                      color: "#fdba74",
                      background: "rgba(249,115,22,0.1)",
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Typography sx={{ fontWeight: 900 }}>
                      {item.technical}
                    </Typography>

                    <CompareArrowsRoundedIcon
                      sx={{ fontSize: 18, color: "text.secondary" }}
                    />

                    <Typography sx={{ fontWeight: 900, color: "#fdba74" }}>
                      {item.kitchen}
                    </Typography>
                  </Stack>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.65,
                      fontSize: "0.92rem",
                    }}
                  >
                    {item.meaning}
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            p: 2.5,
            borderRadius: "24px",
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Typography sx={{ fontWeight: 900 }}>
            Why this mapping matters
          </Typography>

          <Typography sx={{ color: "text.secondary", mt: 0.8, lineHeight: 1.75 }}>
            Good learning tools do not only show information. They create a
            mental model. Kitchen mode makes abstract systems concepts easier to
            understand without weakening the actual logic underneath.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default KitchenMappingSection;