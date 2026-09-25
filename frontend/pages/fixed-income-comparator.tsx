import { Comparator } from "@/features/fixed-income-comparison/comparator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCurrentRates } from "@/shared/hooks/use-current-rates";
import { getApiErrorMessage } from "@/shared/lib/api";

export function FixedIncomeComparatorPage() {
  const { data: current, error } = useCurrentRates();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Comparador de renda fixa</h1>
        <p className="text-muted-foreground">
          Opções de renda fixa lado a lado, pelo que entregam líquido de IR e IOF. Nada
          é gravado.
        </p>
      </div>
      {error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : current ? (
        <Comparator current={current} />
      ) : (
        <Skeleton className="h-40 w-full" />
      )}
    </div>
  );
}
