import { useState } from "react";
import { Link } from "react-router-dom";

import {
  type PendingClassification,
  useAcceptClassifications,
  usePendingClassifications,
} from "@/features/data-health/use-classification";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { type Sector, useSectors } from "@/shared/hooks/use-sectors";
import { getApiErrorMessage } from "@/shared/lib/api";
import { segmentLabel, sourceLabel } from "@/shared/lib/classification";

/** Os ativos sem segmento com a sugestão de cada um. Toda sugestão começa marcada, e
nada é gravado antes do "Aceitar". */
export function ClassificationSuggestions() {
  const { data, isPending, error } = usePendingClassifications();
  const { data: sectors = [] } = useSectors();
  const accept = useAcceptClassifications();
  // Só o que foi desmarcado: toda sugestão nova chega marcada
  const [unchecked, setUnchecked] = useState<ReadonlySet<number>>(new Set());

  if (isPending) {
    return <Skeleton className="h-24 w-full" />;
  }
  if (error) {
    return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  }

  const acceptable = data.items.flatMap((item) =>
    item.suggestion?.segment_id != null
      ? [{ asset_id: item.asset_id, segment_id: item.suggestion.segment_id }]
      : [],
  );
  const chosen = acceptable.filter((item) => !unchecked.has(item.asset_id));
  const toggle = (assetId: number, checked: boolean) =>
    setUnchecked((current) => {
      const next = new Set(current);
      if (checked) next.delete(assetId);
      else next.add(assetId);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      {data.source_unavailable && (
        <p className="text-muted-foreground text-sm">
          O Yahoo não respondeu, e parte dos ativos ficou sem sugestão. Abrir a página de novo tenta
          outra vez.
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Ativo</TableHead>
            <TableHead>No Yahoo</TableHead>
            <TableHead>Sugestão</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((item) => (
            <TableRow key={item.asset_id}>
              <TableCell>
                {item.suggestion?.segment_id != null && (
                  <Checkbox
                    aria-label={`Aceitar a sugestão de ${item.ticker}`}
                    checked={!unchecked.has(item.asset_id)}
                    onCheckedChange={(checked) => toggle(item.asset_id, checked)}
                  />
                )}
              </TableCell>
              <TableCell className="font-medium">{item.ticker}</TableCell>
              <TableCell variant="muted" className="whitespace-normal">
                {item.suggestion ? sourceLabel(item.suggestion) : "—"}
              </TableCell>
              <TableCell className="whitespace-normal">
                <SuggestionText
                  item={item}
                  sectors={sectors}
                  sourceUnavailable={data.source_unavailable}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link to={`/assets/${item.asset_id}`} />}
                >
                  Editar ativo
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {acceptable.length > 0 && (
        <Button
          className="self-start"
          disabled={chosen.length === 0 || accept.isPending}
          onClick={() => accept.mutate(chosen)}
        >
          {chosen.length === 1 ? "Aceitar 1 sugestão" : `Aceitar ${chosen.length} sugestões`}
        </Button>
      )}
    </div>
  );
}

interface SuggestionTextProps {
  item: PendingClassification;
  sectors: Sector[];
  sourceUnavailable: boolean;
}

function SuggestionText({ item, sectors, sourceUnavailable }: SuggestionTextProps) {
  const { suggestion } = item;
  if (suggestion?.segment_id != null) {
    return <>{segmentLabel(sectors, suggestion.segment_id)}</>;
  }
  const hint = suggestion
    ? "Nenhum ativo seu desta indústria tem segmento. Classifique um no Editar ativo, e os outros da mesma indústria passam a ter sugestão."
    : sourceUnavailable
      ? "Sem resposta do Yahoo."
      : "O Yahoo não classifica este ativo.";
  return <span className="text-muted-foreground">{hint}</span>;
}
