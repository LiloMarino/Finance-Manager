import { Plus } from "lucide-react";

import { DivisionCard } from "@/features/subportfolios/division-card";
import { SubportfolioOverviewCard } from "@/features/subportfolios/subportfolio-overview-card";
import { SubportfolioWizard } from "@/features/subportfolios/subportfolio-wizard";
import { useDivision } from "@/features/subportfolios/use-division";
import { PageHeader } from "@/shared/components/page-header";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSubportfolios } from "@/shared/hooks/use-subportfolios";
import { getApiErrorMessage } from "@/shared/lib/api";

export function SubportfoliosPage() {
  const { data, isPending, error } = useSubportfolios();
  const division = useDivision();

  return (
    <>
      <PageHeader
        title="Subcarteiras"
        description="Grupos que você cria dentro da carteira, cada um com a sua meta de distribuição. Cada ativo ou título fica em uma subcarteira só."
        actions={
          <SubportfolioWizard
            trigger={
              <Button>
                <Plus />
                Nova subcarteira
              </Button>
            }
          />
        }
      />

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhuma subcarteira. Crie uma e escolha os ativos e os títulos dela, ou escolha a
          subcarteira no Editar de cada ativo e de cada título.
        </p>
      ) : (
        <>
          <DivisionCard subportfolios={data} />

          {/* Um card por subcarteira */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((subportfolio) => (
              <SubportfolioOverviewCard
                key={subportfolio.id}
                subportfolio={subportfolio}
                slice={division.data?.slices.find(
                  (slice) => slice.subportfolio_id === subportfolio.id,
                )}
              />
            ))}
            <SubportfolioWizard
              trigger={
                <button
                  type="button"
                  className="border-border-strong text-ink-2 hover:bg-muted grid min-h-48 place-items-center rounded-xl border border-dashed font-medium"
                >
                  Nova subcarteira
                </button>
              }
            />
          </div>

          <p className="text-caption text-muted-foreground">
            Para ver Carteira, Evolução, Rentabilidade, Proventos, Risco e Correlação de uma
            subcarteira só, troque a carteira no topo da sidebar.
          </p>
        </>
      )}
    </>
  );
}
