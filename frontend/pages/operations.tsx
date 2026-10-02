import { FileUp, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { readFilters, writeFilters } from "@/features/operations/filter-params";
import { OperationFilters } from "@/features/operations/operation-filters";
import { OperationFormDialog } from "@/features/operations/operation-form-dialog";
import { OperationsTable } from "@/features/operations/operations-table";
import { useOperations } from "@/features/operations/use-operations";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

export function OperationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const { data, isPending, error } = useOperations(filters);

  return (
    <>
      <PageHeader
        title="Operações"
        description="A fonte de tudo: posição e preço médio são recalculados daqui."
        actions={
          <>
            <Button variant="outline" nativeButton={false} render={<Link to="/import" />}>
              <FileUp />
              Importar
            </Button>
            <OperationFormDialog
              trigger={
                <Button>
                  <Plus />
                  Nova operação
                </Button>
              }
            />
          </>
        }
      />

      <OperationFilters
        filters={filters}
        onChange={(next) => setSearchParams((params) => writeFilters(params, next))}
      />

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>
              {data.length} operação{data.length !== 1 ? "s" : ""} · as mais recentes primeiro
            </CardDescription>
          </CardHeader>
          <CardContent data-flush>
            <OperationsTable operations={data} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
