export function validateTask(req, res, next) {
  const { name, cpu, ram, priority, executionTime } = req.body;
  if (
    !name ||
    cpu == null ||
    ram == null ||
    priority == null ||
    executionTime == null
  ) {
    return res.status(400).json({
      error: "Missing required fields: name,cpu,ram,priority,executionTime",
    });
  }
  if (
    typeof cpu !== "number" ||
    typeof ram !== "number" ||
    typeof priority !== "number" ||
    typeof executionTime !== "number"
  ) {
    return res
      .status(400)
      .json({ error: "cpu, ram, priority and executionTime must be numbers" });
  }
  if (cpu <= 0 || ram <= 0)
    return res.status(400).json({ error: "CPU and RAM must be > 0" });
  if (![1, 2, 3].includes(priority))
    return res
      .status(400)
      .json({ error: "priority must be 1 (high), 2 (medium) or 3 (low)" });
  next();
}

export function validateServer(req, res, next) {
  const { name, totalCPU, totalRAM } = req.body;
  if (!name || totalCPU == null || totalRAM == null)
    return res
      .status(400)
      .json({ error: "Missing fields: name,totalCPU,totalRAM" });
  if (typeof totalCPU !== "number" || typeof totalRAM !== "number")
    return res
      .status(400)
      .json({ error: "totalCPU and totalRAM must be numbers" });
  if (totalCPU <= 0 || totalRAM <= 0)
    return res.status(400).json({ error: "totalCPU and totalRAM must be > 0" });
  next();
}
