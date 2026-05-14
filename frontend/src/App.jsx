import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import LearnPage from "./pages/LearnPage";
import SimulatorPage from "./pages/SimulatorPage";
import RoomsPage from "./pages/RoomsPage";

import ProtectedSimulatorRoute from "./routes/ProtectedSimulatorRoute";
import ProtectedRoomsRoute from "./routes/ProtectedRoomsRoute";
import { SimulatorProvider } from "./context/SimulatorContext";
import PageShell from "./components/layout/PageShell";

function App() {
  return (
    <Router>
      <PageShell>
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
      </PageShell>
    </Router>
  );
}

export default App;
