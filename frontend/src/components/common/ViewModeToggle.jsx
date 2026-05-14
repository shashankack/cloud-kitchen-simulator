import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import { useViewMode } from "../../context/ViewModeContext";

function ViewModeToggle() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <ToggleButtonGroup
      exclusive
      value={viewMode}
      onChange={(_, value) => {
        if (value) setViewMode(value);
      }}
      size="small"
      sx={{
        p: 0.5,
        borderRadius: 999,
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.14)",

        "& .MuiToggleButton-root": {
          border: 0,
          borderRadius: 999,
          px: 1.8,
          py: 0.8,
          gap: 0.8,
          color: "text.secondary",
          fontWeight: 800,

          "&.Mui-selected": {
            color: "text.primary",
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.28), rgba(34,211,238,0.2))",
          },

          "&.Mui-selected:hover": {
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.34), rgba(34,211,238,0.26))",
          },
        },
      }}
    >
      <ToggleButton value="technical">
        <CloudQueueRoundedIcon fontSize="small" />
        Technical
      </ToggleButton>

      <ToggleButton value="kitchen">
        <RestaurantRoundedIcon fontSize="small" />
        Kitchen
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default ViewModeToggle;
