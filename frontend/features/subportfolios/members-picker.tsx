import { TriangleAlert } from "lucide-react";
import { useState } from "react";

import { ColorSwatch } from "@/shared/components/color-swatch";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
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
import type { components } from "@/types/openapi.generated";

export type Members = components["schemas"]["MembersInDTO"];

interface Item {
  key: string;
  kind: "asset" | "investment";
  id: number;
  category: PortfolioCategory;
  label: string;
  /** Os tickers antigos do ativo, que a busca também encontra */
  keywords: string[];
  /** Ativo na fonte mono, título em texto comum */
  isAsset: boolean;
  /** Membro desta subcarteira que não está mais em carteira */
  zeroed: boolean;
  /** A outra subcarteira em que o item está hoje, se está em alguma */
  elsewhere: Subportfolio | undefined;
  /** Fora de toda subcarteira, só na carteira geral */
  free: boolean;
  selected: boolean;
}

interface MembersPickerProps {
  members: Members;
  onChange: (members: Members) => void;
  assets: Asset[];
  investments: FixedIncome[];
  subportfolios: Subportfolio[];
  /** A subcarteira em edição; na criação, nenhuma. */
  subportfolioId?: number;
}

type Filter = "all" | "free" | "chosen";

const listFormat = new Intl.ListFormat("pt-BR");

/** Os ativos e os títulos de uma subcarteira, agrupados por categoria, com busca. A
 * lista oferece o que está em carteira hoje e, na edição, os membros que zeraram, para
 * poderem sair. */
export function MembersPicker({
  members,
  onChange,
  assets,
  investments,
  subportfolios,
  subportfolioId,
}: MembersPickerProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const elsewhereOf = (id: number | null) =>
    id === subportfolioId ? undefined : subportfolios.find((item) => item.id === id);

  const items: Item[] = [
    ...assets
      .filter((asset) => asset.held || asset.subportfolio_id === subportfolioId)
      .map((asset) => ({
        key: `asset-${asset.id}`,
        kind: "asset" as const,
        id: asset.id,
        category: asset.asset_class,
        label: asset.ticker,
        keywords: asset.previous_tickers.map((item) => item.ticker),
        isAsset: true,
        zeroed: !asset.held,
        elsewhere: elsewhereOf(asset.subportfolio_id),
        free: asset.subportfolio_id === null,
        selected: members.asset_ids.includes(asset.id),
      })),
    ...investments
      .filter((investment) => investment.held || investment.subportfolio_id === subportfolioId)
      .map((investment) => ({
        key: `investment-${investment.id}`,
        kind: "investment" as const,
        id: investment.id,
        category: "fixed_income" as const,
        label: investment.label,
        keywords: [],
        isAsset: false,
        zeroed: !investment.held,
        elsewhere: elsewhereOf(investment.subportfolio_id),
        free: investment.subportfolio_id === null,
        selected: members.investment_ids.includes(investment.id),
      })),
  ];

  // Marca ou desmarca vários itens de uma vez, partindo da escolha de agora
  const choose = (changed: Item[], selected: boolean) => {
    const assetIds = new Set(members.asset_ids);
    const investmentIds = new Set(members.investment_ids);
    for (const item of changed) {
      const ids = item.kind === "asset" ? assetIds : investmentIds;
      if (selected) ids.add(item.id);
      else ids.delete(item.id);
    }
    onChange({ asset_ids: [...assetIds], investment_ids: [...investmentIds] });
  };

  const text = query.trim().toLowerCase();
  const visible = items.filter(
    (item) =>
      [item.label, ...item.keywords].some((word) => word.toLowerCase().includes(text)) &&
      (filter === "all" || (filter === "free" ? item.free : item.selected)),
  );
  const selected = items.filter((item) => item.selected);
  // Os itens escolhidos que hoje estão em outra subcarteira, contados por ela
  const leaving = new Map<string, number>();
  for (const item of selected) {
    if (item.elsewhere === undefined) continue;
    leaving.set(item.elsewhere.name, (leaving.get(item.elsewhere.name) ?? 0) + 1);
  }
  const leavingNames = [...leaving.keys()];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Busca e filtro */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
              if (next === "all" || next === "free" || next === "chosen") setFilter(next);
            }}
          >
            <ToggleGroupItem value="all">Todos</ToggleGroupItem>
            <ToggleGroupItem value="free">Sem subcarteira</ToggleGroupItem>
            <ToggleGroupItem value="chosen">Escolhidos</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <span className="text-caption text-muted-foreground">
          {selected.length} {selected.length === 1 ? "item escolhido" : "itens escolhidos"} de{" "}
          {items.length}
        </span>
      </div>

      {/* Lista por categoria */}
      <div className="border-border flex min-h-40 flex-1 flex-col overflow-auto rounded-md border">
        {portfolioCategories.map((category) => {
          const group = visible.filter((item) => item.category === category);
          if (group.length === 0) return null;
          const all = group.every((item) => item.selected);
          const inCategory = items.filter((item) => item.category === category);
          return (
            <div key={category} className="flex flex-col">
              <label className="bg-muted text-eyebrow text-muted-foreground sticky top-0 z-10 flex h-8 shrink-0 items-center gap-2.5 px-3 uppercase">
                <Checkbox
                  aria-label={`Marcar todos de ${portfolioCategoryConfig[category].label}`}
                  checked={all}
                  onCheckedChange={(checked) => choose(group, checked === true)}
                />
                <span className="flex-1">{portfolioCategoryConfig[category].label}</span>
                <Badge variant="count">
                  {inCategory.filter((item) => item.selected).length} / {inCategory.length}
                </Badge>
              </label>
              {group.map((item) => (
                <label
                  key={item.key}
                  className="border-border-subtle flex min-h-9 shrink-0 items-center gap-2.5 border-b px-3 py-1.5"
                >
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={(checked) => choose([item], checked === true)}
                  />
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <ColorSwatch color={portfolioCategoryConfig[item.category].color} />
                    <span className={item.isAsset ? "text-ticker truncate font-mono" : "truncate"}>
                      {item.label}
                    </span>
                  </span>
                  {item.zeroed && <Badge variant="warning">Zerado</Badge>}
                  {item.elsewhere && <Badge variant="outline">em {item.elsewhere.name}</Badge>}
                </label>
              ))}
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="text-caption text-muted-foreground p-3">
            {items.length === 0 ? "Nenhum ativo ou título em carteira." : "Nenhum item encontrado."}
          </p>
        )}
      </div>

      {/* Itens que saem de outra subcarteira */}
      {leavingNames.length > 0 && (
        <Alert variant="warning">
          <TriangleAlert />
          <AlertTitle>
            {listFormat.format(
              [...leaving].map(
                ([name, count], index) =>
                  `${count} ${index > 0 ? "" : count === 1 ? "item sai " : "itens saem "}de ${name}`,
              ),
            )}
          </AlertTitle>
          <AlertDescription>
            Cada item fica em uma subcarteira só. As metas de {listFormat.format(leavingNames)}{" "}
            precisam ser revistas depois.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
