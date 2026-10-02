import { TriangleAlert } from "lucide-react";
import { useState } from "react";

import { ColorSwatch } from "@/shared/components/color-swatch";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import type { Asset } from "@/shared/hooks/use-assets";
import type { FixedIncome } from "@/shared/hooks/use-fixed-income-list";
import type { Subportfolio } from "@/shared/hooks/use-subportfolios";
import {
  type PortfolioCategory,
  portfolioCategories,
  portfolioCategoryConfig,
} from "@/shared/lib/portfolio-category";

export interface Members {
  assetIds: number[];
  investmentIds: number[];
}

interface Item {
  key: string;
  kind: "asset" | "investment";
  id: number;
  category: PortfolioCategory;
  label: string;
  /** Ativo na fonte mono, título em texto comum */
  isAsset: boolean;
  /** A subcarteira em que o item está hoje, se está em alguma */
  current: Subportfolio | undefined;
  selected: boolean;
}

interface MembersStepProps {
  members: Members;
  onChange: (members: Members) => void;
  assets: Asset[];
  investments: FixedIncome[];
  subportfolios: Subportfolio[];
}

type Filter = "all" | "free";

/** Passo 2: os ativos e os títulos da subcarteira, agrupados por categoria, com busca. */
export function MembersStep({
  members,
  onChange,
  assets,
  investments,
  subportfolios,
}: MembersStepProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const nameOf = (id: number | null) => subportfolios.find((item) => item.id === id);

  const items: Item[] = [
    ...assets.map((asset) => ({
      key: `asset-${asset.id}`,
      kind: "asset" as const,
      id: asset.id,
      category: asset.asset_class,
      label: asset.ticker,
      isAsset: true,
      current: nameOf(asset.subportfolio_id),
      selected: members.assetIds.includes(asset.id),
    })),
    ...investments.map((investment) => ({
      key: `investment-${investment.id}`,
      kind: "investment" as const,
      id: investment.id,
      category: "fixed_income" as const,
      label: investment.label,
      isAsset: false,
      current: nameOf(investment.subportfolio_id),
      selected: members.investmentIds.includes(investment.id),
    })),
  ];

  // Marca ou desmarca vários itens de uma vez, partindo da escolha de agora
  const choose = (changed: Item[], selected: boolean) => {
    const assetIds = new Set(members.assetIds);
    const investmentIds = new Set(members.investmentIds);
    for (const item of changed) {
      const ids = item.kind === "asset" ? assetIds : investmentIds;
      if (selected) ids.add(item.id);
      else ids.delete(item.id);
    }
    onChange({ assetIds: [...assetIds], investmentIds: [...investmentIds] });
  };

  const text = query.trim().toLowerCase();
  const visible = items.filter(
    (item) =>
      item.label.toLowerCase().includes(text) && (filter === "all" || item.current === undefined),
  );
  const selected = items.filter((item) => item.selected);
  // Os itens escolhidos que hoje estão em outra subcarteira, agrupados por ela
  const leaving = new Map<string, Item[]>();
  for (const item of selected) {
    if (item.current === undefined) continue;
    leaving.set(item.current.name, [...(leaving.get(item.current.name) ?? []), item]);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Busca e filtro */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            value={query}
            placeholder="Buscar ativo ou título"
            aria-label="Buscar ativo ou título"
            onChange={(event) => setQuery(event.target.value)}
          />
          <ToggleGroup
            variant="segmented"
            aria-label="Mostrar"
            value={[filter]}
            onValueChange={([next]) => {
              if (next === "all" || next === "free") setFilter(next);
            }}
          >
            <ToggleGroupItem value="all">Todos</ToggleGroupItem>
            <ToggleGroupItem value="free">Sem subcarteira</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <span className="text-caption text-muted-foreground">
          {selected.length} {selected.length === 1 ? "item escolhido" : "itens escolhidos"} de{" "}
          {items.length}
        </span>
      </div>

      {/* Lista por categoria */}
      <div className="border-border flex h-80 flex-col overflow-auto rounded-md border">
        {portfolioCategories.map((category) => {
          const group = visible.filter((item) => item.category === category);
          if (group.length === 0) return null;
          const all = group.every((item) => item.selected);
          return (
            <div key={category} className="flex flex-col">
              <label className="bg-muted text-eyebrow text-muted-foreground sticky top-0 z-10 flex h-8 shrink-0 items-center gap-2.5 px-3 uppercase">
                <Checkbox
                  aria-label={`Marcar todos de ${portfolioCategoryConfig[category].label}`}
                  checked={all}
                  onCheckedChange={(checked) => choose(group, checked === true)}
                />
                <span className="flex-1">{portfolioCategoryConfig[category].label}</span>
              </label>
              {group.map((item) => (
                <label
                  key={item.key}
                  className="border-border-subtle flex h-9 shrink-0 items-center gap-2.5 border-b px-3"
                >
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={(checked) => choose([item], checked === true)}
                  />
                  <span className="flex flex-1 items-center gap-2">
                    <ColorSwatch color={portfolioCategoryConfig[item.category].color} />
                    <span className={item.isAsset ? "text-ticker font-mono" : undefined}>
                      {item.label}
                    </span>
                  </span>
                  {item.current && (
                    <span className="text-caption text-muted-foreground">
                      em {item.current.name}
                    </span>
                  )}
                </label>
              ))}
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="text-caption text-muted-foreground p-3">Nenhum item encontrado.</p>
        )}
      </div>

      {/* Itens que saem de outra subcarteira */}
      {[...leaving].map(([name, moved]) => (
        <Alert key={name} variant="warning">
          <TriangleAlert />
          <AlertTitle>
            {moved.length} {moved.length === 1 ? "item sai" : "itens saem"} de {name}
          </AlertTitle>
          <AlertDescription>
            Cada item fica em uma subcarteira só. As metas de {name} precisam ser revistas depois.
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
