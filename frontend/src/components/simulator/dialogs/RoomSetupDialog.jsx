// components/simulator/dialogs/RoomSetupDialog.jsx
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";

function RoomSetupDialog({ open }) {
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: "30px",
          background:
            "linear-gradient(180deg, rgba(10,15,28,0.98), rgba(6,11,22,0.96))",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h4">Start a Simulation Room</Typography>

        <Typography sx={{ color: "text.secondary", mt: 1 }}>
          Create or join a room before running the simulator.
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: "22px",
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6">Create New Room</Typography>

              <TextField
                label="Room Name"
                placeholder="Team A Simulation"
                fullWidth
              />

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                fullWidth
              >
                Create Room
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: "22px",
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6">Join Existing Room</Typography>

              <TextField label="Room ID" placeholder="room-abc123" fullWidth />

              <Button
                variant="outlined"
                startIcon={<LoginRoundedIcon />}
                fullWidth
              >
                Join Room
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default RoomSetupDialog;
