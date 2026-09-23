import { PositionsTable } from "@/features/portfolio/positions-table";
import { usePositions } from "@/features/portfolio/use-positions";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

export function HomePage() {
  const { data, isPending, error } = usePositions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Carteira</h1>
        <p className="text-muted-foreground">
          Posição atual de cada ativo, recalculada a partir das operações.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <PositionsTable positions={data} />
      )}
    </div>
  );
}
