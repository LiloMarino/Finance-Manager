import { ColorSwatch } from "@/shared/components/color-swatch";
import { DonutChart } from "@/shared/components/donut-chart";
import { type DecimalString, formatPercent, toChartNumber } from "@/types/decimal";

export interface ShareItem {
  key: string;
  label: string;
  /** Ativo na fonte mono; o grupo, como a renda fixa, em texto comum */
  isAsset: boolean;
  color: string;
  /** A fração do item, nula quando não há. */
  share: DecimalString | null;
}

/** O rótulo do item com o marcador na cor dele. */
export function ShareLabel({ item }: { item: Pick<ShareItem, "label" | "isAsset" | "color"> }) {
  return (
    <span className="flex items-center gap-2">
      <ColorSwatch color={item.color} />
      <span className={item.isAsset ? "text-ticker font-mono" : undefined}>{item.label}</span>
    </span>
  );
}

/** Uma rosca com a fração de cada item ao lado. */
export function ShareDonut({
  heading,
  caption,
  items,
}: {
  heading: string;
  caption: string;
  items: ShareItem[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-label">{heading}</h3>
        <span className="text-caption text-muted-foreground">{caption}</span>
      </div>
      <div className="flex items-center gap-5">
        <DonutChart
          slices={items.map((item) => ({
            key: item.key,
            color: item.color,
            value: item.share === null ? 0 : toChartNumber(item.share),
          }))}
          center={<span className="text-caption text-muted-foreground">{heading}</span>}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {items.map((item) => (
            <span key={item.key} className="flex items-center justify-between gap-6">
              <span className="text-ink-2">
                <ShareLabel item={item} />
              </span>
              <span className="tabular-nums">
                {item.share === null ? "—" : formatPercent(item.share)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
