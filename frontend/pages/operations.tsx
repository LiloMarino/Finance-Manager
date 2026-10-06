import { ArrowLeftRight, FileUp, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { hasFilters, readFilters, writeFilters } from "@/features/operations/filter-params";
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
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
      ) : data.length === 0 && !hasFilters(filters) ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArrowLeftRight />
            </EmptyMedia>
            <EmptyTitle>Nenhuma operação registrada</EmptyTitle>
            <EmptyDescription>
              Importe as notas de corretagem e o extrato da B3, ou registre compra, venda e evento
              corporativo à mão. A posição e o preço médio saem daqui.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" nativeButton={false} render={<Link to="/import" />}>
              <FileUp />
              Importar notas e extrato
            </Button>
            <OperationFormDialog
              trigger={
                <Button>
                  <Plus />
                  Nova operação
                </Button>
              }
            />
          </EmptyContent>
        </Empty>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>
              {data.length} operação{data.length !== 1 ? "s" : ""} · as mais recentes primeiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OperationsTable operations={data} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
