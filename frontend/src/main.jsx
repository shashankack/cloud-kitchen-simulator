import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App.jsx";
import theme from "./theme/theme.js";
import "./index.css";
import { ViewModeProvider } from "./context/ViewModeContext.jsx";
import { RoomProvider } from "./context/RoomContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ViewModeProvider>
        <RoomProvider>
          <App />
        </RoomProvider>
      </ViewModeProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
