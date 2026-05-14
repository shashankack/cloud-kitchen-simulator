import { Box, Chip, Grid, Stack, Typography } from "@mui/material";

import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import SensorsRoundedIcon from "@mui/icons-material/SensorsRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

import { useViewMode } from "../../context/ViewModeContext";

const fallbackSteps = [
  {
    icon: <SensorsRoundedIcon />,
    title: "Socket works first",
    kitchenTitle: "Live updates work first",
    detail: "Socket.io is the primary realtime path.",
    kitchenDetail: "Live kitchen updates are the primary path.",
  },
  {
    icon: <WifiOffRoundedIcon />,
    title: "Connection may drop",
    kitchenTitle: "Connection may drop",
    detail: "Realtime connections are not guaranteed to stay alive forever.",
    kitchenDetail: "The live kitchen feed may temporarily disconnect.",
  },
  {
    icon: <ReplayRoundedIcon />,
    title: "Polling starts",
    kitchenTitle: "Refresh loop starts",
    detail: "The frontend fetches fresh state every few hundred milliseconds.",
    kitchenDetail:
      "The kitchen screen refreshes room state every few hundred milliseconds.",
  },
  {
    icon: <SyncRoundedIcon />,
    title: "State stays updated",
    kitchenTitle: "Room stays updated",
    detail: "The UI remains near-realtime even without socket events.",
    kitchenDetail:
      "Orders, stations, and capacity stay updated even during socket issues.",
  },
  {
    icon: <VerifiedRoundedIcon />,
    title: "Socket returns",
    kitchenTitle: "Live feed returns",
    detail:
      "When sockets reconnect, realtime events become the main update path again.",
    kitchenDetail:
      "When the live feed reconnects, instant updates take over again.",
  },
];

function PollingFallbackSection() {
  const { isKitchen } = useViewMode();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at bottom right, rgba(234,179,8,0.13), transparent 34%), rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<WifiOffRoundedIcon />}
            label="Polling Fallback"
            sx={{
              width: "fit-content",
              color: "#fde68a",
              background: "rgba(234,179,8,0.1)",
              border: "1px solid rgba(234,179,8,0.22)",
              fontWeight: 800,
            }}
          />

          <Typography variant="h3">
            {isKitchen
              ? "What happens when live kitchen updates disconnect"
              : "What happens when realtime sockets disconnect"}
          </Typography>

          <Typography
            sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 940 }}
          >
            {isKitchen
              ? "The app should not become useless just because the live connection drops. Polling is the backup path that keeps the kitchen screen close to the latest room state."
              : "The app should not depend blindly on a perfect socket connection. Polling is the backup path that keeps the simulator close to the latest room state."}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {fallbackSteps.map((step, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={step.title}>
              <Box
                sx={{
                  height: "100%",
                  p: 2.2,
                  borderRadius: "24px",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Stack spacing={1.4}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "16px",
                      display: "grid",
                      placeItems: "center",
                      color: "#fde68a",
                      background: "rgba(234,179,8,0.1)",
                    }}
                  >
                    {step.icon}
                  </Box>

                  <Typography sx={{ color: "#fde68a", fontWeight: 900 }}>
                    0{index + 1}
                  </Typography>

                  <Typography variant="h6">
                    {isKitchen ? step.kitchenTitle : step.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.65,
                      fontSize: "0.92rem",
                    }}
                  >
                    {isKitchen ? step.kitchenDetail : step.detail}
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
            The reliability lesson
          </Typography>

          <Typography
            sx={{ color: "text.secondary", mt: 0.8, lineHeight: 1.75 }}
          >
            Sockets are fast, but polling is safer as a fallback. A good
            realtime app should still recover state when events are missed,
            connections drop, or users reconnect after being inactive.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default PollingFallbackSection;
