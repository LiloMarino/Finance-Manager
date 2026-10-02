import { itemColors } from "@/features/subportfolios/item-colors";
import {
  type TargetsDraft,
  targetsSum,
  typedPercent,
} from "@/features/subportfolios/wizard-targets";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import type { Asset } from "@/shared/hooks/use-assets";
import { maskPercent } from "@/shared/lib/mask";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

interface Row {
  key: string;
  label: string;
  category: PortfolioCategory;
  isAsset: boolean;
  value: string;
  set: (value: string) => void;
}

interface TargetsStepProps {
  targets: TargetsDraft;
  onChange: (targets: TargetsDraft) => void;
  /** Os ativos escolhidos no passo anterior */
  assets: Asset[];
  /** Há título de renda fixa escolhido */
  hasFixedIncome: boolean;
}

/** Passo 3: quanto cada item deve pesar na subcarteira e os limites do aviso. */
export function TargetsStep({ targets, onChange, assets, hasFixedIncome }: TargetsStepProps) {
  const rows: Row[] = [
    ...assets.map((asset) => ({
      key: `asset-${asset.id}`,
      label: asset.ticker,
      category: asset.asset_class,
      isAsset: true,
      value: targets.assets[asset.id] ?? "",
      set: (value: string) =>
        onChange({ ...targets, assets: { ...targets.assets, [asset.id]: value } }),
    })),
    ...(hasFixedIncome
      ? [
          {
            key: "fixed-income",
            label: "Renda fixa",
            category: "fixed_income" as const,
            isAsset: false,
            value: targets.fixedIncome,
            set: (value: string) => onChange({ ...targets, fixedIncome: value }),
          },
        ]
      : []),
  ];
  const colors = itemColors(rows);
  const sum = targetsSum(targets, assets, hasFixedIncome);
  const complete = Math.abs(sum - 100) < 0.005;

  // Divide 100 entre os itens; o que sobra do arredondamento fica no primeiro
  const split = () => {
    const share = Math.floor((10000 / rows.length) * 100) / 100;
    const first = 100 - share * (rows.length - 1);
    const format = (value: number) => maskPercent(String(value).replace(".", ","));
    onChange({
      ...targets,
      assets: Object.fromEntries(
        assets.map((asset, index) => [asset.id, format(index === 0 ? first : share)]),
      ),
      fixedIncome: hasFixedIncome ? format(assets.length === 0 ? first : share) : "",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-caption text-muted-foreground flex items-center justify-between">
          <span>Item</span>
          <span className="w-28 text-right">Meta</span>
        </div>
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <ColorSwatch color={colors[rows.indexOf(row)] ?? "var(--border-strong)"} />
              <span className={row.isAsset ? "text-ticker font-mono" : undefined}>{row.label}</span>
            </span>
            <Input
              inputMode="decimal"
              aria-label={`Meta de ${row.label}`}
              className="w-28 text-right"
              value={row.value}
              onChange={(event) => row.set(maskPercent(event.target.value))}
            />
          </div>
        ))}

        {/* Soma */}
        <div className="mt-2 flex flex-col gap-1.5">
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
            {rows.map((row, index) => (
              <span
                key={row.key}
                className="bg-(--item) flex-(--weight) basis-0"
                style={{ "--item": colors[index], "--weight": typedPercent(row.value) }}
              />
            ))}
          </div>
          <div className="text-caption text-muted-foreground flex items-center justify-between">
            <Button type="button" variant="ghost" size="sm" onClick={split}>
              Dividir igualmente
            </Button>
            <span className="flex items-center gap-2">
              Soma das metas
              <span className={complete ? "text-gain font-semibold" : "text-loss font-semibold"}>
                {sum.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Limites do aviso */}
      <div className="border-border-subtle flex flex-col gap-3 border-t pt-4">
        <div>
          <span className="text-label">Limites do aviso</span>
          <p className="text-caption text-muted-foreground">
            Passou deles, a subcarteira vira pendência em Dados e entra no alerta diário.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="limit-item">Por item (p.p.)</FieldLabel>
            <Input
              id="limit-item"
              inputMode="decimal"
              className="text-right"
              value={targets.maxItem}
              onChange={(event) =>
                onChange({ ...targets, maxItem: maskPercent(event.target.value) })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="limit-total">Na soma dos desvios (p.p.)</FieldLabel>
            <Input
              id="limit-total"
              inputMode="decimal"
              className="text-right"
              value={targets.maxTotal}
              onChange={(event) =>
                onChange({ ...targets, maxTotal: maskPercent(event.target.value) })
              }
            />
          </Field>
        </div>
        <FieldDescription>
          A soma dos desvios é o desbalanceamento: quanto a subcarteira está longe da meta num
          número só.
        </FieldDescription>
      </div>
    </div>
  );
}
