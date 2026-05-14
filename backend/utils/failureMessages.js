// Realistic failure messages for simulated task failures
const failureMessages = [
  "CPU spike exceeded threshold",
  "Memory allocation failed",
  "Timeout waiting for resource lock",
  "Network connectivity lost",
  "Disk I/O error occurred",
  "Authentication token expired",
  "Database connection timeout",
  "Insufficient disk space",
  "Thread pool exhausted",
  "Cache invalidation failed",
  "Service dependency unavailable",
  "Request rate limit exceeded",
  "Deadlock detected in transaction",
  "Memory leak suspected",
  "Connection pool exhausted",
  "File descriptor limit reached",
  "Socket bind failed",
  "DNS resolution timeout",
  "SSL certificate validation failed",
  "Garbage collection pause exceeded",
  "Queue overflow condition",
  "Buffer underrun detected",
  "Scheduling deadline missed",
  "Resource quota exceeded",
  "Device not ready",
];

export function generateRandomFailureMessage() {
  return failureMessages[
    Math.floor(Math.random() * failureMessages.length)
  ];
}
