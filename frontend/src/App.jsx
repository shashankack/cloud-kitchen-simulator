import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const ArchitecturePage = lazy(() => import("./pages/ArchitecturePage"));
const LearnPage = lazy(() => import("./pages/LearnPage"));
const SimulatorPage = lazy(() => import("./pages/SimulatorPage"));
const RoomsPage = lazy(() => import("./pages/RoomsPage"));

import ProtectedSimulatorRoute from "./routes/ProtectedSimulatorRoute";
import ProtectedRoomsRoute from "./routes/ProtectedRoomsRoute";
import { SimulatorProvider } from "./context/SimulatorContext";
import PageShell from "./components/layout/PageShell";

function App() {
  return (
    <Router>
      <PageShell>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/rooms"
              element={
                <ProtectedRoomsRoute>
                  <RoomsPage />
                </ProtectedRoomsRoute>
              }
            />
            <Route
              path="/simulator"
              element={
                <ProtectedSimulatorRoute>
                  <SimulatorProvider>
                    <SimulatorPage />
                  </SimulatorProvider>
                </ProtectedSimulatorRoute>
              }
            />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
          </Routes>
        </Suspense>
      </PageShell>
    </Router>
  );
}

export default App;
