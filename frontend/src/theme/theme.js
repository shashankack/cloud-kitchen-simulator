import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    background: {
      default: "#02050d",
      paper: "#060b16",
      elevated: "#0b1120",
    },

    primary: {
      main: "#4cc9f0",
      light: "#72dbf7",
      dark: "#1699c7",
      contrastText: "#ffffff",
    },

    secondary: {
      main: "#7dd3fc",
      light: "#bae6fd",
      dark: "#38bdf8",
      contrastText: "#ffffff",
    },

    success: {
      main: "#22c55e",
    },

    warning: {
      main: "#f59e0b",
    },

    error: {
      main: "#ef4444",
    },

    text: {
      primary: "#f8fafc",
      secondary: "#bacde7",
      disabled: "#475569",
    },

    divider: "rgba(255,255,255,0.06)",
  },

  typography: {
    fontFamily: `"Inter", sans-serif`,

    h1: {
      fontFamily: `"Space Grotesk", sans-serif`,
      fontWeight: 700,
      letterSpacing: "-0.06em",
      lineHeight: 0.95,
    },

    h2: {
      fontFamily: `"Space Grotesk", sans-serif`,
      fontWeight: 700,
      letterSpacing: "-0.05em",
      lineHeight: 1,
    },

    h3: {
      fontFamily: `"Space Grotesk", sans-serif`,
      fontWeight: 700,
      letterSpacing: "-0.04em",
    },

    h4: {
      fontFamily: `"Space Grotesk", sans-serif`,
      fontWeight: 700,
    },

    h5: {
      fontFamily: `"Space Grotesk", sans-serif`,
      fontWeight: 700,
    },

    h6: {
      fontFamily: `"Space Grotesk", sans-serif`,
      fontWeight: 700,
    },

    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
    },

    body2: {
      lineHeight: 1.6,
    },

    button: {
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: "-0.01em",
    },
  },

  shape: {
    borderRadius: 22,
  },

  shadows: [
    "none",
    "0 8px 24px rgba(0,0,0,0.35)",
    "0 12px 32px rgba(0,0,0,0.38)",
    "0 18px 48px rgba(0,0,0,0.42)",
    "0 24px 60px rgba(0,0,0,0.46)",
    ...Array(20).fill("0 32px 80px rgba(0,0,0,0.55)"),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `
            radial-gradient(circle at top left, rgba(76,201,240,0.08), transparent 25%),
            radial-gradient(circle at top right, rgba(125,211,252,0.06), transparent 20%),
            radial-gradient(circle at bottom center, rgba(59,130,246,0.08), transparent 28%),
            #02050d
          `,
          color: "#f8fafc",
          minHeight: "100vh",
          overflowX: "hidden",
        },

        "*": {
          boxSizing: "border-box",
        },

        "::-webkit-scrollbar": {
          width: "10px",
        },

        "::-webkit-scrollbar-track": {
          background: "#02050d",
        },

        "::-webkit-scrollbar-thumb": {
          background: "#111827",
          borderRadius: "999px",
        },

        "::selection": {
          background: "rgba(76,201,240,0.25)",
          color: "#ffffff",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(2, 5, 13, 0.72)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundImage: "none",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(6, 11, 22, 0.82)",
          border: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(18px)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: `
            linear-gradient(
              180deg,
              rgba(10,15,28,0.96),
              rgba(6,11,22,0.88)
            )
          `,
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: "10px 22px",
          boxShadow: "none",
          width: "fit-content",
        },

        containedPrimary: {
          background: "linear-gradient(135deg, #4cc9f0 0%, #3b82f6 100%)",
          boxShadow: "0 12px 40px rgba(76,201,240,0.22)",

          "&:hover": {
            boxShadow: "0 18px 50px rgba(76,201,240,0.32)",
          },
        },

        outlined: {
          borderColor: "rgba(255,255,255,0.08)",
          color: "#f8fafc",

          "&:hover": {
            background: "rgba(255,255,255,0.03)",
            borderColor: "rgba(76,201,240,0.4)",
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "rgba(255,255,255,0.02)",

          "& fieldset": {
            borderColor: "rgba(255,255,255,0.08)",
          },

          "&:hover fieldset": {
            borderColor: "rgba(76,201,240,0.28)",
          },

          "&.Mui-focused fieldset": {
            borderColor: "#4cc9f0",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        },

        head: {
          color: "#64748b",
          fontWeight: 800,
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        },
      },
    },
  },

  custom: {
    gradients: {
      hero: "linear-gradient(135deg, #02050d 0%, #060b16 45%, #0f172a 100%)",

      primary: "linear-gradient(135deg, #4cc9f0 0%, #3b82f6 100%)",

      glass:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
    },

    status: {
      waiting: "#f59e0b",
      running: "#4cc9f0",
      completed: "#22c55e",
      failed: "#ef4444",
    },
  },
});

export default theme;
