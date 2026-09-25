import { Plus } from "lucide-react";

import { NameDialog } from "@/features/sectors/name-dialog";
import { SectorCard } from "@/features/sectors/sector-card";
import { useCreateSector } from "@/features/sectors/use-sector-mutations";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSectors } from "@/shared/hooks/use-sectors";
import { getApiErrorMessage } from "@/shared/lib/api";

export function SectorsPage() {
  const { data, isPending, error } = useSectors();
  const create = useCreateSector();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Setores</h1>
          <p className="text-muted-foreground">
            Cada ativo aponta para um segmento, e o setor vem por ele. A Carteira mostra
            a renda variável dividida por eles.
          </p>
        </div>
        <NameDialog
          title="Novo setor"
          save={create}
          trigger={
            <Button>
              <Plus />
              Novo setor
            </Button>
          }
        />
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum setor cadastrado. Crie um setor e os segmentos dele, e classifique os
          ativos pelo Editar de cada um.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((sector) => (
            <SectorCard key={sector.id} sector={sector} />
          ))}
        </div>
      )}
    </div>
  );
}
