// Simple smoke test script that checks the /health endpoint.
// Requires the API to be running locally. Set BASE_URL if different.
const BASE = process.env.BASE_URL || "http://localhost:5000";

(async () => {
  try {
    const res = await fetch(`${BASE}/health`);
    const data = await res.json();
    console.log("Health response:", res.status, data);
    process.exit(0);
  } catch (err) {
    console.error("Smoke test failed:", err.message);
    process.exit(1);
  }
})();
