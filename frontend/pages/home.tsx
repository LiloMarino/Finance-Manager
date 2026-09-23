import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { get, getApiErrorMessage } from "@/shared/lib/api";

export function HomePage() {
  const { data, isPending, error } = useQuery({
    queryKey: ["health"],
    queryFn: () => get("/api/health"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Carteira</h1>
        <p className="text-muted-foreground">
          O patrimônio consolidado vai aparecer aqui.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Conexão com o backend</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Skeleton className="h-5 w-48" />
          ) : error ? (
            <span className="text-destructive">{getApiErrorMessage(error)}</span>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Status</dt>
              <dd>{data.status}</dd>
              <dt className="text-muted-foreground">Versão</dt>
              <dd>{data.version}</dd>
              <dt className="text-muted-foreground">Verificado em</dt>
              <dd>{new Date(data.checked_at).toLocaleTimeString("pt-BR")}</dd>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
