import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";

type TankDetailAccessContextValue = {
  accessGranted: boolean;
  grantAccess: () => void;
  revokeAccess: () => void;
};

const TankDetailAccessContext = createContext<TankDetailAccessContextValue | null>(null);

export function TankDetailAccessProvider({ children }: PropsWithChildren) {
  const [accessGranted, setAccessGranted] = useState(false);
  const grantAccess = useCallback(() => setAccessGranted(true), []);
  const revokeAccess = useCallback(() => setAccessGranted(false), []);
  const value = useMemo(
    () => ({ accessGranted, grantAccess, revokeAccess }),
    [accessGranted, grantAccess, revokeAccess],
  );

  return <TankDetailAccessContext.Provider value={value}>{children}</TankDetailAccessContext.Provider>;
}

export function useTankDetailAccess() {
  const context = useContext(TankDetailAccessContext);

  if (!context) {
    throw new Error("useTankDetailAccess deve ser usado dentro de TankDetailAccessProvider");
  }

  return context;
}
