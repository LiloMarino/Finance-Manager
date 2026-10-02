import { useState } from "react";

import { SegmentCombobox } from "@/features/assets/segment-combobox";
import { SegmentCreateDialog } from "@/features/assets/segment-create-dialog";
import { useAssignSegments } from "@/features/assets/use-asset-mutations";
import { useClassificationSuggestion } from "@/features/assets/use-classification";
import { TickerLabel } from "@/shared/components/ticker-label";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import type { Asset } from "@/shared/hooks/use-assets";
import { sourceLabel } from "@/shared/lib/classification";

interface RowProps {
  asset: Asset;
  segmentId: number | null;
  onChange: (segmentId: number | null) => void;
  onCreate: (name: string) => void;
}

/** O ativo, o que o Yahoo diz dele e o segmento a escolher. */
function UnclassifiedRow({ asset, segmentId, onChange, onCreate }: RowProps) {
  const { data: suggestion } = useClassificationSuggestion(asset.ticker);

  return (
    <TableRow>
      <TableCell>
        <TickerLabel ticker={asset.ticker} category={asset.asset_class} />
      </TableCell>
      <TableCell variant="muted">
        {suggestion ? sourceLabel(suggestion) || "sem classificação no Yahoo" : "consultando…"}
      </TableCell>
      <TableCell className="w-72">
        <SegmentCombobox
          id={`segment-${asset.id}`}
          value={segmentId}
          onChange={onChange}
          onCreate={onCreate}
        />
      </TableCell>
    </TableRow>
  );
}

/** Os ativos sem segmento, com a escolha de cada um e um botão que grava todas de uma vez. */
export function UnclassifiedAssets({ assets }: { assets: Asset[] }) {
  const save = useAssignSegments();
  const [choices, setChoices] = useState<Record<number, number>>({});
  // O ativo que está pedindo um segmento novo e o nome digitado
  const [creating, setCreating] = useState<{ asset: Asset; name: string } | null>(null);

  const chosen = assets.flatMap((asset) => {
    const segmentId = choices[asset.id];
    return segmentId === undefined ? [] : [{ asset, segmentId }];
  });
  const choose = (assetId: number, segmentId: number | null) =>
    setChoices((current) => {
      const rest = { ...current };
      delete rest[assetId];
      return segmentId === null ? rest : { ...rest, [assetId]: segmentId };
    });

  return (
    <Card variant="warning">
      <CardHeader>
        <CardTitle>
          {assets.length} {assets.length === 1 ? "ativo sem segmento" : "ativos sem segmento"}
        </CardTitle>
        <CardAction>
          <span className="text-caption text-muted-foreground">
            Na Carteira, eles aparecem em Sem classificação
          </span>
        </CardAction>
      </CardHeader>
      <CardContent data-flush>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ativo</TableHead>
              <TableHead>No Yahoo</TableHead>
              <TableHead>Segmento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <UnclassifiedRow
                key={asset.id}
                asset={asset}
                segmentId={choices[asset.id] ?? null}
                onChange={(segmentId) => choose(asset.id, segmentId)}
                onCreate={(name) => setCreating({ asset, name })}
              />
            ))}
          </TableBody>
        </Table>
        <div className="border-border flex justify-end border-t px-5 pt-3">
          <Button
            size="sm"
            disabled={chosen.length === 0 || save.isPending}
            onClick={() => save.mutate(chosen, { onSuccess: () => setChoices({}) })}
          >
            Salvar {chosen.length} {chosen.length === 1 ? "segmento" : "segmentos"}
          </Button>
        </div>
      </CardContent>
      <SegmentCreateDialog
        draft={
          creating === null ? null : { sectorId: null, sectorName: "", segmentName: creating.name }
        }
        onClose={() => setCreating(null)}
        onCreated={(segmentId) => creating && choose(creating.asset.id, segmentId)}
      />
    </Card>
  );
}
