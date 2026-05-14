import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { useViewMode } from "../../context/ViewModeContext";

const steps = [
  {
    title: "Sort waiting work",
    kitchenTitle: "Sort waiting orders",
    detail: "Higher priority items are checked first. If priority is equal, older items go first.",
  },
  {
    title: "Check available resources",
    kitchenTitle: "Check station capacity",
    detail: "The system checks whether a server has enough free CPU and RAM.",
  },
  {
    title: "Simulate allocation",
    kitchenTitle: "Simulate order assignment",
    detail: "Before actually assigning, the scheduler temporarily imagines the task placed on that server.",
  },
  {
    title: "Run safety check",
    kitchenTitle: "Run kitchen safety check",
    detail: "It verifies whether running and waiting work can still finish after this assignment.",
  },
  {
    title: "Allocate only if safe",
    kitchenTitle: "Assign only if safe",
    detail: "If the state is safe, the task runs. If not, it waits.",
  },
];

function BankersAlgorithmSection() {
  const { isKitchen } = useViewMode();

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: "32px",
        background:
          "radial-gradient(circle at top right, rgba(76,201,240,0.14), transparent 34%), rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <Chip
            icon={<BalanceRoundedIcon />}
            label={isKitchen ? "Safe Kitchen Allocation" : "Banker’s Algorithm"}
            sx={{
              width: "fit-content",
              color: "primary.main",
              background: "rgba(76,201,240,0.1)",
              border: "1px solid rgba(76,201,240,0.22)",
              fontWeight: 800,
            }}
          />

          <Typography variant="h3">
            {isKitchen
              ? "How the kitchen avoids overload"
              : "How Banker’s Algorithm prevents unsafe allocation"}
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.8,
              maxWidth: 940,
            }}
          >
            {isKitchen
              ? "A kitchen should not accept an assignment just because one chef station has space right now. It must also make sure the remaining orders can still be completed safely."
              : "A scheduler should not assign a task just because one server has enough free CPU and RAM right now. It must also check whether the full system remains in a safe state after the assignment."}
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "28px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <SecurityRoundedIcon color="primary" />

                  <Typography variant="h5">The core idea</Typography>

                  <Typography sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                    {isKitchen
                      ? "The manager checks whether an order can be assigned without trapping the kitchen in a state where future orders cannot be completed."
                      : "The algorithm checks whether a task can be assigned without trapping the system in a state where remaining tasks cannot complete."}
                  </Typography>

                  <Divider />

                  <Box>
                    <Typography sx={{ fontWeight: 900 }}>
                      Unsafe does not mean impossible.
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mt: 0.8 }}>
                      It means the system cannot guarantee that all work can finish safely after the current decision.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Grid container spacing={1.5}>
              {steps.map((step, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={step.title}>
                  <Box
                    sx={{
                      height: "100%",
                      p: 2,
                      borderRadius: "22px",
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "primary.main",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                      }}
                    >
                      STEP {index + 1}
                    </Typography>

                    <Typography sx={{ fontWeight: 900, mt: 0.6 }}>
                      {isKitchen ? step.kitchenTitle : step.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: "text.secondary",
                        mt: 0.8,
                        lineHeight: 1.65,
                        fontSize: "0.92rem",
                      }}
                    >
                      {step.detail}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Box
          sx={{
            p: 2.5,
            borderRadius: "24px",
            background: "rgba(76,201,240,0.08)",
            border: "1px solid rgba(76,201,240,0.18)",
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <MemoryRoundedIcon color="primary" />
            <Box>
              <Typography sx={{ fontWeight: 900 }}>
                How your app implements it
              </Typography>
              <Typography sx={{ color: "text.secondary", mt: 0.8, lineHeight: 1.75 }}>
                The backend scheduler sorts waiting work by priority, finds eligible servers,
                checks CPU/RAM fit, performs a safety check, assigns safe work, and emits realtime
                updates to the active room. Failed work can return to the queue through retry flow. 
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2.5,
            borderRadius: "24px",
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <CheckCircleRoundedIcon color="primary" />
            <Typography sx={{ color: "text.secondary", lineHeight: 1.75 }}>
              The important lesson: allocation is not just about available resources. It is about
              making a decision that keeps the whole system recoverable.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

export default BankersAlgorithmSection;