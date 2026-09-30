import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useSectors } from "@/shared/hooks/use-sectors";
import { type Suggestion, segmentLabel, sourceLabel } from "@/shared/lib/classification";

interface ClassificationHintProps {
  suggestion: Suggestion;
  /** O segmento escolhido no form agora. */
  value: number | null;
  onUse: (segmentId: number) => void;
  onCreate: () => void;
}

/** O que o Yahoo diz do ticker e o segmento que ele sugere. Nada é gravado aqui: o
botão só preenche o campo. */
export function ClassificationHint({
  suggestion,
  value,
  onUse,
  onCreate,
}: ClassificationHintProps) {
  const { data: sectors = [] } = useSectors();
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
          <Button type="button" variant="outline" size="xs" onClick={() => onUse(segmentId)}>
            Usar
          </Button>
        </span>
      )}
      {segmentId === null && value === null && suggestion.new_segment_name && (
        <span>
          <Button type="button" variant="outline" size="xs" onClick={onCreate}>
            <Plus />
            Criar {suggestion.new_segment_name}
            {sectorName && ` em ${sectorName}`}
          </Button>
        </span>
      )}
    </div>
  );
}
