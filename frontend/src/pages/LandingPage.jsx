import React from "react";
import { Box, Container } from "@mui/material";
import AboutSimulatorSection from "./sections/AboutSimulatorSection";
import HeroSection from "./sections/HeroSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import ConceptsReviewSection from "./sections/ConceptsReviewSection";
import CTASection from "./sections/CTASection";

const LandingPage = () => {
  return (
    <Box sx={{ overflow: "hidden" }}>
      <HeroSection />
      <AboutSimulatorSection />
      <HowItWorksSection />
      <ConceptsReviewSection />
      <CTASection />
    </Box>
  );
};

export default LandingPage;
