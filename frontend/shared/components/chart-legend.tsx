import type { ReactNode } from "react";

import { ColorSwatch } from "@/shared/components/color-swatch";

export interface LegendEntry {
  key: string;
  label: ReactNode;
  color: string;
  shape?: "dot" | "square" | "line" | "dashed";
}

/** A legenda de um gráfico, acima dele: o marcador de cada série e o nome. */
export function ChartLegend({ entries }: { entries: LegendEntry[] }) {
  return (
    <div className="text-caption text-ink-2 flex flex-wrap gap-x-3.5 gap-y-1">
      {entries.map((entry) => (
        <span key={entry.key} className="inline-flex items-center gap-1.5">
          <ColorSwatch color={entry.color} shape={entry.shape} />
          {entry.label}
        </span>
      ))}
    </div>
  );
}
