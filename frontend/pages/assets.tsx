import { Plus } from "lucide-react";

import { AssetFormDialog } from "@/features/assets/asset-form-dialog";
import { AssetsTable } from "@/features/assets/assets-table";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAssets } from "@/shared/hooks/use-assets";
import { getApiErrorMessage } from "@/shared/lib/api";

export function AssetsPage() {
  const { data, isPending, error } = useAssets();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ativos</h1>
          <p className="text-muted-foreground">
            Cadastro dos ativos. A importação cria os que ainda não existem.
          </p>
        </div>
        <AssetFormDialog
          trigger={
            <Button>
              <Plus />
              Novo ativo
            </Button>
          }
        />
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <AssetsTable assets={data} />
      )}
    </div>
  );
}
