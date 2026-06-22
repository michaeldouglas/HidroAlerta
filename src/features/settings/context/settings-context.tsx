import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

export type UnitSystem = "metric" | "imperial";

type NotificationPreferences = {
  critical: boolean;
  warning: boolean;
  summaries: boolean;
};

type SettingsContextValue = {
  unitSystem: UnitSystem;
  setUnitSystem: (value: UnitSystem) => void;
  notifications: NotificationPreferences;
  setNotification: (key: keyof NotificationPreferences, value: boolean) => void;
  automaticBackup: boolean;
  setAutomaticBackup: (value: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    critical: true,
    warning: true,
    summaries: false,
  });
  const [automaticBackup, setAutomaticBackup] = useState(true);

  const value = useMemo<SettingsContextValue>(
    () => ({
      unitSystem,
      setUnitSystem,
      notifications,
      setNotification: (key, enabled) =>
        setNotifications((current) => ({ ...current, [key]: enabled })),
      automaticBackup,
      setAutomaticBackup,
    }),
    [automaticBackup, notifications, unitSystem],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings deve ser usado dentro de SettingsProvider");
  }

  return context;
}
