import { type ReactNode, useCallback, useState } from "react";

import { SCOPE_STORAGE_KEY, ScopeContext } from "@/shared/hooks/use-portfolio-scope";
import { readStored, writeStored } from "@/shared/lib/browser-storage";

function parseStored(): number | undefined {
  const parsed = Number(readStored(SCOPE_STORAGE_KEY));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

/** A subcarteira escolhida no seletor da sidebar, que vale para todas as telas e
fica guardada no navegador. */
export function PortfolioScopeProvider({ children }: { children: ReactNode }) {
  const [stored, setStoredState] = useState(parseStored);
  const setStored = useCallback((subportfolioId: number | undefined) => {
    setStoredState(subportfolioId);
    writeStored(SCOPE_STORAGE_KEY, subportfolioId === undefined ? null : String(subportfolioId));
  }, []);
  return <ScopeContext value={{ stored, setStored }}>{children}</ScopeContext>;
}
