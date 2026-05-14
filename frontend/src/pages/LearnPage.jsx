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

import IntroSection from "../components/learn/IntroSection";
import LearnTopicShell from "../components/learn/LearnTopicShell";

function LearnPage() {
  return (
    <Box
      className="learn-page"
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        py: { xs: 2, md: 4 },
      }}
    >
      <Box className="learn-bg-blob learn-bg-blob-one" />
      <Box className="learn-bg-blob learn-bg-blob-two" />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          <IntroSection />

          <LearnTopicShell />
        </Stack>
      </Container>
    </Box>
  );
}

export default LearnPage;
