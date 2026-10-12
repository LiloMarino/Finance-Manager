import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useSectors } from "@/shared/hooks/use-sectors";
import { type Suggestion, segmentLabel, sourceLabel } from "@/shared/lib/classification";
import type { AssetClass } from "@/shared/lib/labels";

interface ClassificationHintProps {
  /** Nula é ativo que o Yahoo não classifica. */
  suggestion: Suggestion | null;
  assetClass: AssetClass;
  /** O segmento escolhido agora. */
  value: number | null;
  onUse: (segmentId: number) => void;
  onCreate: () => void;
  disabled?: boolean;
}

/** O que o Yahoo diz do ticker e o segmento que ele sugere, existente ou a criar. */
export function ClassificationHint({
  suggestion,
  assetClass,
  value,
  onUse,
  onCreate,
  disabled,
}: ClassificationHintProps) {
  const { data: sectors = [] } = useSectors();

  if (!suggestion) {
    return (
      <span className="text-muted-foreground text-sm">
        {assetClass === "etf"
          ? "O Yahoo não classifica ETF: crie um segmento pelo índice que ele segue, como Ibovespa, S&P 500 ou Ouro."
          : "Sem classificação no Yahoo."}
      </span>
    );
  }

  const segmentId = suggestion.segment_id;
  const suggested = segmentId === null ? undefined : segmentLabel(sectors, segmentId);
  const sectorName =
    sectors.find((sector) => sector.id === suggestion.sector_id)?.name ??
    suggestion.new_sector_name;

  return (
    <div className="text-muted-foreground flex flex-col gap-1.5 text-sm">
      <span>Yahoo: {sourceLabel(suggestion)}</span>
      {segmentId !== null && suggested && segmentId !== value && (
        <span className="flex flex-wrap items-center gap-2">
          Sugestão: <span className="text-foreground">{suggested}</span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={disabled}
            onClick={() => onUse(segmentId)}
          >
            Usar
          </Button>
        </span>
      )}
      {segmentId === null && value === null && suggestion.new_segment_name && (
        <span>
          <Button type="button" variant="outline" size="xs" disabled={disabled} onClick={onCreate}>
            <Plus />
            Criar {suggestion.new_segment_name}
            {sectorName && ` em ${sectorName}`}
          </Button>
        </span>
      )}
    </div>
  );
}
