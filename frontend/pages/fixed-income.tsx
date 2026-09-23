import { Plus } from "lucide-react";

import { FixedIncomeFormDialog } from "@/features/fixed-income/fixed-income-form-dialog";
import { FixedIncomeTable } from "@/features/fixed-income/fixed-income-table";
import { useFixedIncomeList } from "@/features/fixed-income/use-fixed-income";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

export function FixedIncomePage() {
  const { data, isPending, error } = useFixedIncomeList();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Renda fixa</h1>
          <p className="text-muted-foreground">
            Valor marcado pela curva do indexador, com o IR regressivo estimado.
          </p>
        </div>
        <FixedIncomeFormDialog
          trigger={
            <Button>
              <Plus />
              Novo título
            </Button>
          }
        />
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <FixedIncomeTable investments={data} />
      )}
    </div>
  );
}
