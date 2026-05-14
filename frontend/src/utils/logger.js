export const logInfo = (msg, data) => {
  if (import.meta.env.DEV) console.info(`[INFO] ${msg}`, data || "");
};

export const logWarn = (msg, data) => {
  if (import.meta.env.DEV) console.warn(`[WARN] ${msg}`, data || "");
};

export const logError = (msg, error) => {
  console.error(`[ERROR] ${msg}`, error || "");
};
