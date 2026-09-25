import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

export const dayChangeHint =
  "Quanto o valor mudou desde o pregão anterior. Ex.: 10 cotas que fecharam a R$ 25 ontem e a R$ 30 hoje variaram +R$ 50 (+20%). Na renda fixa, é o rendimento do último dia útil.";

export const totalChangeHint =
  "Valor de hoje menos o que você pagou (quantidade × preço médio). Ex.: 10 cotas com preço médio de R$ 20 valendo R$ 30 dão +R$ 100 (+50%). Na renda fixa, é o valor bruto menos o aplicado.";

/** Rótulo de métrica com a definição num tooltip. */
export function MetricHint({ children, hint }: { children: ReactNode; hint: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="text-muted-foreground size-3.5" aria-label={hint} />
        </TooltipTrigger>
        <TooltipContent className="max-w-72">{hint}</TooltipContent>
      </Tooltip>
    </span>
  );
}
