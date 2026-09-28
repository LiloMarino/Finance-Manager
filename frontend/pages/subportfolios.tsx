import { Plus } from "lucide-react";

import { SubportfolioCard } from "@/features/subportfolios/subportfolio-card";
import { useCreateSubportfolio } from "@/features/subportfolios/use-subportfolio-mutations";
import { NameDialog } from "@/shared/components/name-dialog";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSubportfolios } from "@/shared/hooks/use-subportfolios";
import { getApiErrorMessage } from "@/shared/lib/api";

export function SubportfoliosPage() {
  const { data, isPending, error } = useSubportfolios();
  const create = useCreateSubportfolio();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Subcarteiras</h1>
          <p className="text-muted-foreground">
            Grupos de ativos e títulos dentro da carteira, cada item em uma só. O seletor
            no topo da Carteira, da Evolução, da Rentabilidade, do Ano a ano e dos
            Proventos mostra uma subcarteira no lugar da carteira geral, com o histórico
            dos membros de hoje.
          </p>
        </div>
        <NameDialog
          title="Nova subcarteira"
          save={create}
          trigger={
            <Button>
              <Plus />
              Nova subcarteira
            </Button>
          }
        />
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma subcarteira. Crie uma e escolha os ativos e os títulos dela, ou
          escolha a subcarteira no Editar de cada ativo e de cada título.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((subportfolio) => (
            <SubportfolioCard key={subportfolio.id} subportfolio={subportfolio} />
          ))}
        </div>
      )}
    </div>
  );
}
