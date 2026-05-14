import { Box } from "@mui/material";
import Navbar from "./Navbar";

const NAVBAR_HEIGHT = 76;

function PageShell({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", color: "text.primary" }}>
      <Navbar />

      <Box
        component="main"
        sx={{
          pt: `${NAVBAR_HEIGHT}px`,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default PageShell;
