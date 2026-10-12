import { useState } from "react";

import { ClassificationHint } from "@/features/assets/classification-hint";
import { SegmentCombobox } from "@/features/assets/segment-combobox";
import { SegmentCreateDialog } from "@/features/assets/segment-create-dialog";
import {
  type PendingItem,
  type SegmentDraft,
  suggestionDraft,
  useAcceptClassification,
  useCreateClassification,
  usePendingClassification,
} from "@/features/assets/use-classification";
import { TickerLabel } from "@/shared/components/ticker-label";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { getApiErrorMessage } from "@/shared/lib/api";

interface RowProps {
  item: PendingItem;
  busy: boolean;
  onAssign: (segmentId: number) => void;
  onCreate: (draft: SegmentDraft) => void;
  onAsk: (name: string) => void;
}

/** O ativo, o que o Yahoo diz dele e o segmento: cada escolha grava na hora. */
function UnclassifiedRow({ item, busy, onAssign, onCreate, onAsk }: RowProps) {
  const { suggestion } = item;
  // A sugestão que diz o setor cria direto; sem ele, o diálogo pergunta
  const createSuggested = () => {
    if (!suggestion) return;
    const draft = suggestionDraft(suggestion);
    if (draft) onCreate(draft);
    else onAsk(suggestion.new_segment_name ?? "");
  };

  return (
    <TableRow>
      <TableCell>
        <span className="flex items-center gap-2">
          <TickerLabel ticker={item.ticker} category={item.asset_class} />
          {!item.held && <Badge variant="outline">fora da carteira</Badge>}
        </span>
      </TableCell>
      <TableCell className="whitespace-normal">
        <ClassificationHint
          suggestion={suggestion}
          assetClass={item.asset_class}
          value={null}
          onUse={onAssign}
          onCreate={createSuggested}
          disabled={busy}
        />
      </TableCell>
      <TableCell className="w-72">
        <SegmentCombobox
          id={`segment-${item.asset_id}`}
          value={null}
          onChange={(segmentId) => segmentId !== null && onAssign(segmentId)}
          onCreate={onAsk}
        />
      </TableCell>
    </TableRow>
  );
}

/** Os ativos sem segmento, em carteira ou não. Usar, criar ou escolher um segmento grava
o ativo na hora, e o segmento novo passa a ser sugerido aos da mesma indústria. */
export function UnclassifiedAssets() {
  const pending = usePendingClassification();
  const accept = useAcceptClassification();
  const create = useCreateClassification();
  // O ativo que está pedindo um segmento novo pelo diálogo e o nome digitado
  const [asking, setAsking] = useState<{ assetId: number; name: string } | null>(null);

  if (pending.isPending) return <Skeleton className="h-40 w-full" />;
  if (pending.error) {
    return <span className="text-destructive">{getApiErrorMessage(pending.error)}</span>;
  }

  const { items, source_unavailable } = pending.data;
  if (items.length === 0) return null;
  const assign = (assetId: number, segmentId: number) =>
    accept.mutate([{ asset_id: assetId, segment_id: segmentId }]);
  const suggested = items.flatMap((item) =>
    item.suggestion?.segment_id == null
      ? []
      : [{ asset_id: item.asset_id, segment_id: item.suggestion.segment_id }],
  );

  return (
    <Card variant="warning">
      <CardHeader>
        <CardTitle>
          {items.length} {items.length === 1 ? "ativo sem segmento" : "ativos sem segmento"}
        </CardTitle>
        <CardAction>
          {suggested.length > 0 && (
            <Button size="sm" disabled={accept.isPending} onClick={() => accept.mutate(suggested)}>
              Aceitar {suggested.length} {suggested.length === 1 ? "sugestão" : "sugestões"}
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        {source_unavailable && (
          <p className="text-caption text-muted-foreground px-5 pb-3">
            O Yahoo não respondeu: os ativos que ele ainda não classificou ficam sem sugestão até a
            próxima consulta.
          </p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ativo</TableHead>
              <TableHead>Sugestão</TableHead>
              <TableHead>Segmento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <UnclassifiedRow
                key={item.asset_id}
                item={item}
                busy={accept.isPending || create.isPending}
                onAssign={(segmentId) => assign(item.asset_id, segmentId)}
                onCreate={(draft) =>
                  create.mutate(draft, {
                    onSuccess: (segment) => assign(item.asset_id, segment.id),
                  })
                }
                onAsk={(name) => setAsking({ assetId: item.asset_id, name })}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <SegmentCreateDialog
        draft={
          asking === null ? null : { sectorId: null, sectorName: "", segmentName: asking.name }
        }
        onClose={() => setAsking(null)}
        onCreated={(segmentId) => asking && assign(asking.assetId, segmentId)}
      />
    </Card>
  );
}
