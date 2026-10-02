import type { ReactNode } from "react";
import { Cell, Pie, PieChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/shared/components/ui/chart";

export interface DonutSlice {
  key: string;
  /** A cor da fatia, como valor CSS. */
  color: string;
  value: number;
}

const emptyConfig = {} satisfies ChartConfig;

/** A rosca com o texto do centro; a legenda fica por conta de quem a usa. */
export function DonutChart({ slices, center }: { slices: DonutSlice[]; center: ReactNode }) {
  return (
    <div className="relative size-36 shrink-0">
      <ChartContainer config={emptyConfig} className="aspect-square size-36">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="key"
            innerRadius={46}
            outerRadius={64}
            paddingAngle={1}
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {slices.map((slice) => (
              <Cell key={slice.key} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {center}
      </div>
    </div>
  );
}
