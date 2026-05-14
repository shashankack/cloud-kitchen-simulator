import { Button, Menu, MenuItem } from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { useState } from "react";
import { useViewMode } from "../../../context/ViewModeContext";

export default function ServerControlsMenu({
  onCreateServer,
  onSeedServers,
  onResetServers,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { isKitchen } = useViewMode();

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCreateServer = () => {
    onCreateServer();
    handleClose();
  };

  const handleSeedServers = () => {
    onSeedServers();
    handleClose();
  };

  const handleResetServers = () => {
    onResetServers();
    handleClose();
  };

  return (
    <>
      <Button variant="outlined" size="small" onClick={handleClick}>
        {isKitchen ? "Chef Controls" : "Server Controls"}{" "}
        <MoreVertRoundedIcon sx={{ ml: 0.5 }} />
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        <MenuItem onClick={handleCreateServer}>
          {isKitchen ? "Create Chef" : "Create Server"}
        </MenuItem>
        <MenuItem onClick={handleSeedServers}>
          {isKitchen ? "Seed Chefs" : "Seed Servers"}
        </MenuItem>
        <MenuItem onClick={handleResetServers} sx={{ color: "error.main" }}>
          {isKitchen ? "Reset All Chefs" : "Reset All Servers"}
        </MenuItem>
      </Menu>
    </>
  );
}
