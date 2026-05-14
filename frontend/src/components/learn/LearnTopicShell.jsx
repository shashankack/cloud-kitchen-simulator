import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";

import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import AutoAwesomeMotionRoundedIcon from "@mui/icons-material/AutoAwesomeMotionRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";

import { useViewMode } from "../../context/ViewModeContext";

import TaskLifeSection from "./TaskLifeSection";
import SchedulerExplainerSection from "./SchedulerExplainerSection";
import BankersAlgorithmSection from "./BankersAlgorithmSection";
import FailureSimulationSection from "./FailureSimulationSection";
import AutoScalingSection from "./AutoScalingSection";
import RealTimeFlowSection from "./RealTimeFlowSection";
import PollingFallbackSection from "./PollingFallbackSection";
import KitchenMappingSection from "./KitchenMappingSection";
import PerformanceAndScalabilitySection from "./PerformanceAndScalabilitySection";

const topics = [
  {
    id: "lifecycle",
    title: "Task Lifecycle",
    subtitle: "Waiting, running, completed, failed, retry",
    icon: <TimelineRoundedIcon />,
    component: <TaskLifeSection />,
  },
  {
    id: "scheduler",
    title: "Scheduler Logic",
    subtitle: "Priority, queue order, dispatch decisions",
    icon: <AccountTreeRoundedIcon />,
    component: <SchedulerExplainerSection />,
  },
  {
    id: "bankers",
    title: "Banker's Algorithm",
    subtitle: "Safe allocation and deadlock prevention",
    icon: <BalanceRoundedIcon />,
    component: <BankersAlgorithmSection />,
  },
  {
    id: "failure",
    title: "Failure & Retry",
    subtitle: "Failure reasons, retry flow, recovery",
    icon: <ErrorRoundedIcon />,
    component: <FailureSimulationSection />,
  },
  {
    id: "scaling",
    title: "Auto Scaling",
    subtitle: "Temporary capacity and cleanup",
    icon: <AutoAwesomeMotionRoundedIcon />,
    component: <AutoScalingSection />,
  },
  {
    id: "realtime",
    title: "Realtime Flow",
    subtitle: "REST actions and socket updates",
    icon: <SyncRoundedIcon />,
    component: <RealTimeFlowSection />,
  },
  {
    id: "polling",
    title: "Polling Fallback",
    subtitle: "Backup sync when sockets disconnect",
    icon: <WifiOffRoundedIcon />,
    component: <PollingFallbackSection />,
  },
  {
    id: "mapping",
    title: "Kitchen Mapping",
    subtitle: "Technical mode vs kitchen mode",
    icon: <CompareArrowsRoundedIcon />,
    component: <KitchenMappingSection />,
  },
  {
    id: "performance",
    title: "Performance",
    subtitle: "Bottlenecks, throughput, pressure",
    icon: <SpeedRoundedIcon />,
    component: <PerformanceAndScalabilitySection />,
  },
];

function LearnTopicShell() {
  const { isKitchen } = useViewMode();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTopic = topics[activeIndex];
  const progress = useMemo(
    () => ((activeIndex + 1) / topics.length) * 100,
    [activeIndex],
  );

  const goPrevious = () => {
    setActiveIndex((current) => Math.max(current - 1, 0));
  };

  const goNext = () => {
    setActiveIndex((current) => Math.min(current + 1, topics.length - 1));
  };

  return (
    <Box component="section" id="learn-topics" sx={{ pt: { xs: 1, md: 2 } }}>
      <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              position: { md: "sticky" },
              top: { md: 104 },
              p: 2.5,
              borderRadius: "32px",
              background:
                "linear-gradient(180deg, rgba(10,14,24,0.94), rgba(10,14,24,0.88))",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
            }}
          >
            <Stack spacing={2.2}>
              <Box>
                <Chip
                  icon={<MenuBookRoundedIcon />}
                  label={`Topic ${activeIndex + 1} of ${topics.length}`}
                  sx={{
                    width: "fit-content",
                    color: "primary.main",
                    background: "rgba(76,201,240,0.1)",
                    border: "1px solid rgba(76,201,240,0.22)",
                    fontWeight: 800,
                  }}
                />

                <Typography variant="h4" sx={{ mt: 2, fontWeight: 900 }}>
                  Learning path
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    lineHeight: 1.7,
                  }}
                >
                  {isKitchen
                    ? "Use kitchen language to follow the same scheduling logic from state to safety to realtime updates."
                    : "Use technical language to follow the scheduling logic from state to safety to realtime updates."}
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                }}
              />

              <Stack
                spacing={1.1}
                sx={{
                  overflowX: { xs: "auto", md: "visible" },
                  pb: { xs: 1, md: 0 },
                  pr: { xs: 0.5, md: 0 },
                }}
              >
                {topics.map((topic, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <Button
                      key={topic.id}
                      onClick={() => setActiveIndex(index)}
                      variant={isActive ? "contained" : "text"}
                      disableElevation
                      startIcon={topic.icon}
                      sx={{
                        width: "100%",
                        minWidth: { xs: 240, md: "auto" },
                        justifyContent: "flex-start",
                        textAlign: "left",
                        alignItems: "flex-start",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: "20px",
                        border: isActive
                          ? "1px solid rgba(76,201,240,0.25)"
                          : "1px solid rgba(255,255,255,0.06)",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(76,201,240,0.18), rgba(168,85,247,0.1))"
                          : "rgba(255,255,255,0.028)",
                        color: isActive ? "#ffffff" : "text.primary",
                        textTransform: "none",
                        whiteSpace: "normal",
                        boxShadow: isActive
                          ? "0 18px 50px rgba(0,0,0,0.18)"
                          : "none",
                        "&:hover": {
                          background: isActive
                            ? "linear-gradient(135deg, rgba(76,201,240,0.22), rgba(168,85,247,0.14))"
                            : "rgba(255,255,255,0.045)",
                        },
                        "& .MuiButton-startIcon": {
                          mt: 0.4,
                          mr: 0,
                          color: isActive ? "#7dd3fc" : "primary.main",
                        },
                      }}
                    >
                      <Stack spacing={0.25} sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                          {topic.title}
                        </Typography>
                        <Typography
                          sx={{
                            color: isActive
                              ? "rgba(255,255,255,0.82)"
                              : "text.secondary",
                            fontSize: "0.82rem",
                            lineHeight: 1.35,
                          }}
                        >
                          {topic.subtitle}
                        </Typography>
                      </Stack>
                    </Button>
                  );
                })}
              </Stack>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label="9 topics"
                  sx={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label={isKitchen ? "Kitchen mode" : "Technical mode"}
                  sx={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label="Realtime synced"
                  sx={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    fontWeight: 700,
                  }}
                />
              </Stack>

              <Button
                component={NavLink}
                to="/rooms"
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: "999px",
                  px: 2.5,
                  fontWeight: 900,
                  borderColor: "rgba(255,255,255,0.16)",
                }}
              >
                Open simulator
              </Button>
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <Box
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: "32px",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 22px 70px rgba(0,0,0,0.2)",
              }}
            >
              <Stack spacing={1.6}>
                <Chip
                  label={activeTopic.title}
                  sx={{
                    width: "fit-content",
                    color: "primary.main",
                    background: "rgba(76,201,240,0.1)",
                    border: "1px solid rgba(76,201,240,0.2)",
                    fontWeight: 800,
                  }}
                />

                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: "2.35rem", md: "3.8rem" },
                    lineHeight: 0.98,
                    letterSpacing: "-0.05em",
                    maxWidth: 860,
                  }}
                >
                  {activeTopic.title}
                </Typography>

                <Typography
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.8,
                    maxWidth: 840,
                    fontSize: { xs: "1rem", md: "1.08rem" },
                  }}
                >
                  {activeTopic.subtitle}
                </Typography>
              </Stack>
            </Box>

            <Box>{activeTopic.component}</Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={goPrevious}
                disabled={activeIndex === 0}
                sx={{
                  borderRadius: "999px",
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 900,
                  borderColor: "rgba(255,255,255,0.16)",
                }}
              >
                Previous topic
              </Button>

              <Button
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={goNext}
                disabled={activeIndex === topics.length - 1}
                sx={{
                  borderRadius: "999px",
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 900,
                }}
              >
                Next topic
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default LearnTopicShell;
