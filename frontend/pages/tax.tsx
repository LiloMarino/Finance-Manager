import { MonthsTable } from "@/features/tax/months-table";
import { useTaxMonths } from "@/features/tax/use-tax";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

export function TaxPage() {
  const { data, isPending, error } = useTaxMonths();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Fiscal</h1>
        <p className="text-muted-foreground">
          Apuração mensal do IR sobre renda variável, pelas regras da Receita, com o DARF
          de cada mês.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <MonthsTable months={[...data].reverse()} />
      )}
    </div>
  );
}
