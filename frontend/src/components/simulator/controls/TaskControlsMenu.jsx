import { Button, Menu, MenuItem } from "@mui/material";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { useState } from "react";
import { useViewMode } from "../../../context/ViewModeContext";

export default function TaskControlsMenu({
  onCreateTask,
  onSeedTasks,
  onAppendTasks,
  onResetTasks,
  taskCount = 0,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { isKitchen } = useViewMode();

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleCreateTask = () => {
    onCreateTask();
    handleClose();
  };

  const handleSeedTasks = () => {
    onSeedTasks();
    handleClose();
  };

  const handleResetTasks = () => {
    onResetTasks();
    handleClose();
  };

  return (
    <>
      <Button variant="outlined" onClick={handleClick}>
        {isKitchen ? "Chef Controls" : "Task Controls"}
        <MoreVertRoundedIcon sx={{ ml: 0.5 }} />
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        <MenuItem onClick={handleCreateTask}>
          {isKitchen ? "Create Order" : "Create Task"}
        </MenuItem>
        <MenuItem onClick={handleSeedTasks}>
          {isKitchen ? "Seed Orders" : "Seed Tasks"}
        </MenuItem>
          <MenuItem onClick={() => { onAppendTasks && onAppendTasks(); handleClose(); }}>
            {isKitchen ? "Append Orders" : "Append Tasks"}
          </MenuItem>
        <MenuItem
          onClick={handleResetTasks}
          sx={{ color: "error.main" }}
          disabled={taskCount === 0}
        >
          {isKitchen ? "Reset All Orders" : "Reset All Tasks"}
        </MenuItem>
      </Menu>
    </>
  );
}
