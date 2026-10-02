import { createContext, useContext } from "react";

import { useSubportfolios } from "@/shared/hooks/use-subportfolios";

export const SCOPE_STORAGE_KEY = "finance-manager:subportfolio";

interface ScopeState {
  stored: number | undefined;
  setStored: (subportfolioId: number | undefined) => void;
}

export const ScopeContext = createContext<ScopeState | null>(null);

/** A subcarteira das visões de carteira; sem ela, a carteira geral. A que foi apagada
volta à carteira geral assim que a lista chega. */
export function usePortfolioScope() {
  const scope = useContext(ScopeContext);
  if (!scope) throw new Error("usePortfolioScope fora do PortfolioScopeProvider");
  const { data: subportfolios } = useSubportfolios();
  const subportfolioId =
    subportfolios && !subportfolios.some((item) => item.id === scope.stored)
      ? undefined
      : scope.stored;
  return [subportfolioId, scope.setStored] as const;
}
