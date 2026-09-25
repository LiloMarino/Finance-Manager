import { FileUp, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { OperationFilters } from "@/features/operations/operation-filters";
import { OperationFormDialog } from "@/features/operations/operation-form-dialog";
import { OperationsTable } from "@/features/operations/operations-table";
import {
  type OperationFilters as Filters,
  useOperations,
} from "@/features/operations/use-operations";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

export function OperationsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const { data, isPending, error } = useOperations(filters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Operações</h1>
          <p className="text-muted-foreground">
            A fonte de tudo: posição e preço médio são recalculados daqui.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/operations/import">
              <FileUp />
              Importar
            </Link>
          </Button>
          <OperationFormDialog
            trigger={
              <Button>
                <Plus />
                Nova operação
              </Button>
            }
          />
        </div>
      </div>

      <OperationFilters filters={filters} onChange={setFilters} />

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <OperationsTable operations={data} />
      )}
    </div>
  );
}
