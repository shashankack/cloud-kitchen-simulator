import { useMemo, useRef } from "react";
import {
  Box,
  LinearProgress,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import "@xyflow/react/dist/style.css";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
} from "@xyflow/react";

import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";

import { useViewMode } from "../../context/ViewModeContext";
import { useSimulator } from "../../context/SimulatorContext";
import { mapNamePair } from "../../utils/nameMapper";

const NODE_WIDTH = 220;

const getPercent = (used = 0, total = 1) => {
  if (!total) return 0;
  return Math.min(100, Math.round((used / total) * 100));
};

const isTooClose = (a, b, minDistance = 260) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) < minDistance;
};

const getSafeServerPosition = ({
  index,
  serversLength,
  seed,
  existingPositions,
}) => {
  const manager = { x: 360, y: 260 };
  const queue = { x: 40, y: 260 };
  const forbidden = [manager, queue];

  for (let attempt = 0; attempt < 100; attempt++) {
    const ring = Math.floor(index / 8);
    const angleStep = 360 / Math.min(serversLength, 8);

    const angle =
      index * angleStep + ((seed + index * 47 + attempt * 29) % 70) - 35;

    const radius =
      390 + ring * 220 + ((seed + index * 83 + attempt * 41) % 140) - 70;

    const position = {
      x: manager.x + Math.cos((angle * Math.PI) / 180) * radius,
      y: manager.y + Math.sin((angle * Math.PI) / 180) * radius,
    };

    const clashesWithCore = forbidden.some((node) =>
      isTooClose(position, node, 330),
    );

    const clashesWithServers = existingPositions.some((node) =>
      isTooClose(position, node, 270),
    );

    if (!clashesWithCore && !clashesWithServers) {
      return position;
    }
  }

  const fallbackRing = Math.floor(index / 8);
  const fallbackAngle = index * (360 / Math.min(serversLength, 8));
  const fallbackRadius = 540 + fallbackRing * 260;

  return {
    x: manager.x + Math.cos((fallbackAngle * Math.PI) / 180) * fallbackRadius,
    y: manager.y + Math.sin((fallbackAngle * Math.PI) / 180) * fallbackRadius,
  };
};

function FlowNode({ data }) {
  const { globalProgress } = useSimulator();
  return (
    <Box
      sx={{
        width: NODE_WIDTH,
        p: 2,
        borderRadius: "22px",
        background: data.active
          ? "linear-gradient(180deg, rgba(76,201,240,0.16), rgba(255,255,255,0.055))"
          : "rgba(255,255,255,0.055)",
        border: data.active
          ? "1.5px solid rgba(76,201,240,0.75)"
          : "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(16px)",
        boxShadow: data.active ? "0 0 48px rgba(76,201,240,0.25)" : "none",
        transition: "all 0.3s ease",
        transform: data.active ? "scale(1.02)" : "scale(1)",
        animation: data.active ? "pulseGlow 2s ease-in-out infinite" : "none",
        "@keyframes pulseGlow": {
          "0%, 100%": {
            boxShadow: "0 0 38px rgba(76,201,240,0.18)",
          },
          "50%": {
            boxShadow: "0 0 58px rgba(76,201,240,0.35)",
          },
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{ opacity: 0 }}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="source-top"
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        style={{ opacity: 0 }}
      />

      <Stack spacing={1.2}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "16px",
              display: "grid",
              placeItems: "center",
              background: data.active
                ? "rgba(76,201,240,0.2)"
                : "rgba(76,201,240,0.12)",
              color: "primary.main",
              transition: "all 0.3s ease",
            }}
          >
            {data.icon}
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {data.title}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
              {data.subtitle}
            </Typography>
          </Box>
        </Stack>

        {data.progress != null && (
          <LinearProgress
            variant="determinate"
            value={globalProgress > 0 ? globalProgress : data.progress}
            sx={{
              height: 6,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
            }}
          />
        )}
      </Stack>
    </Box>
  );
}

const nodeTypes = {
  flowNode: FlowNode,
};

function SimulationCanvas() {
  const { isKitchen } = useViewMode();
  const { tasks = [], servers = [], loading } = useSimulator();
  const layoutSeedRef = useRef(Math.random() * 10000);

  const waitingTasks = tasks.filter((task) => task.status === "waiting");
  const runningTasks = tasks.filter(
    (task) => task.status === "running" || task.status === "paused",
  );

  const { nodes, edges } = useMemo(() => {
    const hasActivity = waitingTasks.length > 0 || runningTasks.length > 0;

    const baseNodes = [
      {
        id: "queue",
        type: "flowNode",
        data: {
          icon: <AccountTreeRoundedIcon />,
          title: isKitchen ? "Order Queue" : "Task Queue",
          subtitle: isKitchen
            ? `${waitingTasks.length} orders waiting`
            : `${waitingTasks.length} tasks waiting`,
          active: waitingTasks.length > 0,
        },
        position: { x: 40, y: 260 },
      },
      {
        id: "scheduler",
        type: "flowNode",
        data: {
          icon: <HubRoundedIcon />,
          title: isKitchen ? "Kitchen Manager" : "Scheduler",
          subtitle: isKitchen
            ? "priority + capacity logic"
            : "priority + banker safety",
          active: hasActivity,
        },
        position: { x: 360, y: 260 },
      },
    ];

    const placedServers = [];

    const serverNodes = servers.map((server, index) => {
      const cpu = getPercent(server.usedCPU, server.totalCPU);
      const ram = getPercent(server.usedRAM, server.totalRAM);
      const { techName, kitchenName } = mapNamePair(server.name);
      const displayName = isKitchen ? kitchenName : techName;

      const position = getSafeServerPosition({
        index,
        serversLength: servers.length,
        seed: layoutSeedRef.current,
        existingPositions: placedServers,
      });

      placedServers.push(position);

      return {
        id: server._id,
        type: "flowNode",
        data: {
          icon: <StorageRoundedIcon />,
          title: displayName,
          subtitle: isKitchen
            ? `${cpu}% capacity • ${ram}% ingredients`
            : `${cpu}% CPU • ${ram}% RAM`,
          progress: cpu,
          active: cpu > 0 || ram > 0,
        },
        position,
      };
    });

    const baseEdges = [
      {
        id: "queue-scheduler",
        source: "queue",
        target: "scheduler",
        sourceHandle: "right",
        targetHandle: "left",
        animated: hasActivity,
        type: "default",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: {
          strokeWidth: hasActivity ? 2.5 : 2,
          stroke: hasActivity
            ? "rgba(76,201,240,0.85)"
            : "rgba(76,201,240,0.65)",
          transition: "all 0.3s ease",
        },
      },
    ];

    const serverEdges = servers.map((server, index) => {
      const active = server.usedCPU > 0 || server.usedRAM > 0;

      const targetHandle =
        index % 3 === 0 ? "left" : index % 3 === 1 ? "top" : "bottom";

      const sourceHandle =
        index % 2 === 0
          ? "right"
          : index % 3 === 0
            ? "source-top"
            : "source-bottom";

      return {
        id: `scheduler-${server._id}`,
        source: "scheduler",
        target: server._id,
        sourceHandle,
        targetHandle,
        animated: active,
        type: "default",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: {
          strokeWidth: active ? 3.5 : 1.5,
          stroke: active ? "rgba(76,201,240,0.95)" : "rgba(255,255,255,0.12)",
          transition: "all 0.3s ease",
          opacity: active ? 1 : 0.6,
          filter: active ? "drop-shadow(0 0 6px rgba(76,201,240,0.6))" : "none",
        },
      };
    });

    return {
      nodes: [...baseNodes, ...serverNodes],
      edges: [...baseEdges, ...serverEdges],
    };
  }, [isKitchen, servers, tasks]);

  if (loading) {
    return (
      <Box sx={{ height: { xs: 560, md: 660 }, borderRadius: "28px" }}>
        <Skeleton
          variant="rectangular"
          height="100%"
          sx={{ borderRadius: 1 }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: { xs: 560, md: 660 },
        borderRadius: "28px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: `
          radial-gradient(circle at center, rgba(76,201,240,0.13), transparent 32%),
          radial-gradient(circle at top right, rgba(168,85,247,0.14), transparent 34%),
          rgba(255,255,255,0.025)
        `,
        ".react-flow__attribution": {
          display: "none",
        },
        ".react-flow__controls": {
          left: 12,
          top: 12,
          background: "transparent",
          boxShadow: "none",
        },
        ".react-flow__controls-button": {
          backgroundColor: "rgba(255,255,255,0.06)",
          color: "text.primary",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
          width: 36,
          height: 36,
          minWidth: 36,
          ml: 0,
          mr: 0,
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.09)",
          },
          "&:focus-visible": {
            outline: "2px solid rgba(76,201,240,0.8)",
            outlineOffset: 2,
          },
        },
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.25}
        maxZoom={1.35}
      >
        <Background color="rgba(255,255,255,0.08)" gap={34} />
        <Controls />
      </ReactFlow>
    </Box>
  );
}

export default SimulationCanvas;
