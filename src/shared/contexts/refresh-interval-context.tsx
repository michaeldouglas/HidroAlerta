import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type RefreshIntervalSeconds = 2 | 5 | 10 | 15 | 20;

type RefreshIntervalContextValue = {
  intervalSeconds: RefreshIntervalSeconds;
  intervalMilliseconds: number;
  remainingSeconds: number;
  lastUpdatedAt: Date;
  refreshCount: number;
  setIntervalSeconds: (seconds: RefreshIntervalSeconds) => void;
};

const RefreshIntervalContext = createContext<RefreshIntervalContextValue | null>(null);

export function RefreshIntervalProvider({ children }: PropsWithChildren) {
  const [intervalSeconds, setIntervalSecondsState] = useState<RefreshIntervalSeconds>(5);
  const [refreshState, setRefreshState] = useState(() => {
    const now = Date.now();
    return {
      now,
      nextRefreshAt: now + 5000,
      lastUpdatedAt: new Date(now),
      refreshCount: 0,
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setRefreshState((current) =>
        now >= current.nextRefreshAt
          ? {
              now,
              nextRefreshAt: now + intervalSeconds * 1000,
              lastUpdatedAt: new Date(now),
              refreshCount: current.refreshCount + 1,
            }
          : { ...current, now },
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [intervalSeconds]);

  const setIntervalSeconds = useCallback((seconds: RefreshIntervalSeconds) => {
    const now = Date.now();
    setIntervalSecondsState(seconds);
    setRefreshState((current) => ({
      ...current,
      now,
      nextRefreshAt: now + seconds * 1000,
    }));
  }, []);

  const remainingSeconds = Math.max(
    0,
    Math.ceil((refreshState.nextRefreshAt - refreshState.now) / 1000),
  );

  const value = useMemo(
    () => ({
      intervalSeconds,
      intervalMilliseconds: intervalSeconds * 1000,
      remainingSeconds,
      lastUpdatedAt: refreshState.lastUpdatedAt,
      refreshCount: refreshState.refreshCount,
      setIntervalSeconds,
    }),
    [intervalSeconds, refreshState.lastUpdatedAt, refreshState.refreshCount, remainingSeconds, setIntervalSeconds],
  );

  return (
    <RefreshIntervalContext.Provider value={value}>
      {children}
    </RefreshIntervalContext.Provider>
  );
}

export function useRefreshInterval() {
  const context = useContext(RefreshIntervalContext);

  if (!context) {
    throw new Error("useRefreshInterval deve ser usado dentro de RefreshIntervalProvider");
  }

  return context;
}
