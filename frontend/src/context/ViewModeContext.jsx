import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ViewModeContext = createContext(null);

const STORAGE_KEY = "cloud-kitchen-view-mode";

export function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || "technical";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, viewMode);
  }, [viewMode]);

  const value = useMemo(
    () => ({
      viewMode,
      isTechnical: viewMode === "technical",
      isKitchen: viewMode === "kitchen",
      setViewMode,
      toggleViewMode: () =>
        setViewMode((prev) => (prev === "technical" ? "kitchen" : "technical")),
    }),
    [viewMode],
  );

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);

  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }

  return context;
}
