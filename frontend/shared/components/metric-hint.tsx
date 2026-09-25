import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

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
