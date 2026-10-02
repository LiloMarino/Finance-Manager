import { createContext, useContext } from "react";

export const PRIVACY_STORAGE_KEY = "finance-manager:hide-values";

interface PrivacyState {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}

export const PrivacyContext = createContext<PrivacyState | null>(null);

/** O modo de ocultar valores, que o `PrivacyProvider` guarda. */
export function usePrivacy() {
  const privacy = useContext(PrivacyContext);
  if (!privacy) throw new Error("usePrivacy fora do PrivacyProvider");
  return privacy;
}
