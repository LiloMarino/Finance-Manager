import { Pencil, Plus } from "lucide-react";

import { DeleteDialog } from "@/features/sectors/delete-dialog";
import { NameDialog } from "@/features/sectors/name-dialog";
import {
  useCreateSegment,
  useDeleteSector,
  useDeleteSegment,
  useRenameSector,
  useRenameSegment,
} from "@/features/sectors/use-sector-mutations";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { Sector, Segment } from "@/shared/hooks/use-sectors";

export function SectorCard({ sector }: { sector: Sector }) {
  const rename = useRenameSector(sector);
  const remove = useDeleteSector(sector);
  const addSegment = useCreateSegment(sector);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sector.name}</CardTitle>
        <CardAction className="flex gap-1">
          <NameDialog
            title={`Novo segmento em ${sector.name}`}
            save={addSegment}
            trigger={
              <Button variant="outline" size="sm">
                <Plus />
                Segmento
              </Button>
            }
          />
          <NameDialog
            title={`Renomear ${sector.name}`}
            initialName={sector.name}
            save={rename}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label={`Renomear ${sector.name}`}>
                <Pencil />
              </Button>
            }
          />
          <DeleteDialog
            name={sector.name}
            description="Só setor sem segmento pode ser apagado."
            remove={remove}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        {sector.segments.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum segmento ainda.</p>
        ) : (
          <ul className="divide-y">
            {sector.segments.map((segment) => (
              <SegmentRow key={segment.id} segment={segment} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function SegmentRow({ segment }: { segment: Segment }) {
  const rename = useRenameSegment(segment);
  const remove = useDeleteSegment(segment);

  return (
    <li className="flex items-center justify-between gap-2 py-1.5">
      <span>
        {segment.name}
        <span className="text-muted-foreground ml-2 text-sm">
          {segment.asset_count === 1 ? "1 ativo" : `${segment.asset_count} ativos`}
        </span>
      </span>
      <span className="flex">
        <NameDialog
          title={`Renomear ${segment.name}`}
          initialName={segment.name}
          save={rename}
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label={`Renomear ${segment.name}`}>
              <Pencil />
            </Button>
          }
        />
        <DeleteDialog
          name={segment.name}
          description="Só segmento sem ativo pode ser apagado. Reclassifique os ativos antes."
          remove={remove}
        />
      </span>
    </li>
  );
}
