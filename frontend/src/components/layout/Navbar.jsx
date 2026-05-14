import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  LinearProgress,
  Typography,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import ViewModeToggle from "../common/ViewModeToggle";
import { useSimulator } from "../../context/SimulatorContext";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Simulator", path: "/simulator" },
  { label: "Learn", path: "/learn" },
  { label: "Architecture", path: "/architecture" },
];

function Navbar() {
  const location = useLocation();
  const { globalProgress, globalLoading } = useSimulator();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "rgba(5, 8, 22, 0.72)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
      }}
    >
      <Box
        sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 4000 }}
      >
        <LinearProgress
          variant={globalProgress > 0 ? "determinate" : "indeterminate"}
          value={globalProgress}
          sx={{ display: globalLoading || globalProgress > 0 ? "block" : "none" }}
        />
      </Box>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 76,
            display: "flex",
            justifyContent: "space-between",
            gap: 3,
            py: 1.5,
          }}
        >
          <Stack
            component={NavLink}
            to="/"
            direction="row"
            spacing={1.3}
            sx={{
              alignItems: "center",
              textDecoration: "none",
              color: "text.primary",
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #3b82f6, #22d3ee)",
                boxShadow: "0 14px 34px rgba(34, 211, 238, 0.28)",
              }}
            >
              <RocketLaunchRoundedIcon sx={{ fontSize: 21 }} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                Cloud Kitchen
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Simulator
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: { xs: "none", md: "flex" },
              p: 0.7,
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(148, 163, 184, 0.14)",
            }}
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  size="small"
                  sx={{
                    px: 2,
                    color: isActive ? "text.primary" : "text.secondary",
                    background: isActive
                      ? "rgba(59, 130, 246, 0.18)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(59, 130, 246, 0.28)"
                      : "1px solid transparent",
                    "&:hover": {
                      background: "rgba(34, 211, 238, 0.08)",
                      color: "text.primary",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
            <Box sx={{ display: { xs: "none", lg: "block" } }}>
              <ViewModeToggle />
            </Box>

            <Button
              component={NavLink}
              to="/rooms"
              variant="contained"
              sx={{
                display: { xs: "none", sm: "inline-flex" },
              }}
            >
              Launch Simulator
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
