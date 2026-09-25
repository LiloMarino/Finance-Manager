import { Simulator } from "@/features/installments/simulator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCurrentRates } from "@/shared/hooks/use-current-rates";
import { getApiErrorMessage } from "@/shared/lib/api";

export function InstallmentsPage() {
  const { data: current, error } = useCurrentRates();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">À vista ou parcelado</h1>
        <p className="text-muted-foreground">
          Compensa o desconto à vista, parcelar deixando o dinheiro aplicado, ou adiantar
          as parcelas que faltam? Nada é gravado.
        </p>
      </div>
      {error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : current ? (
        <Simulator current={current} />
      ) : (
        <Skeleton className="h-40 w-full" />
      )}
    </div>
  );
}
