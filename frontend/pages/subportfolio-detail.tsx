import { Pencil } from "lucide-react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

import { useCash } from "@/features/cash/use-cash";
import { CurrentVsTarget } from "@/features/rebalance/current-vs-target";
import { RebalancePanel } from "@/features/rebalance/rebalance-panel";
import { TargetsDialog } from "@/features/rebalance/targets-dialog";
import { useRebalance } from "@/features/rebalance/use-rebalance";
import { MembersDialog } from "@/features/subportfolios/members-dialog";
import {
  useDeleteSubportfolio,
  useRenameSubportfolio,
} from "@/features/subportfolios/use-subportfolio-mutations";
import { useDivision } from "@/features/subportfolios/use-division";
import { DeleteDialog } from "@/shared/components/delete-dialog";
import { Money } from "@/shared/components/money";
import { NameDialog } from "@/shared/components/name-dialog";
import { PageHeader } from "@/shared/components/page-header";
import { SubportfolioMark } from "@/shared/components/subportfolio-mark";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { type Subportfolio, useSubportfolios } from "@/shared/hooks/use-subportfolios";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatPercent } from "@/types/decimal";

const tabs = ["current", "rebalance"] as const;
type Tab = (typeof tabs)[number];

function isTab(value: string | null): value is Tab {
  return tabs.some((tab) => tab === value);
}

/** O cabeçalho com a identidade, os atalhos de edição e as abas da subcarteira. */
function Detail({ subportfolio }: { subportfolio: Subportfolio }) {
  const rebalance = useRebalance(subportfolio.id);
  const division = useDivision();
  const cash = useCash();
  const rename = useRenameSubportfolio(subportfolio);
  const remove = useDeleteSubportfolio(subportfolio);
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: Tab = isTab(requested) ? requested : "current";

  const slice = division.data?.slices.find((item) => item.subportfolio_id === subportfolio.id);
  const items = subportfolio.assets.length + subportfolio.fixed_income.length;

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => setSearchParams(next === "current" ? {} : { tab: String(next) })}
      className="gap-6"
    >
      <PageHeader
        breadcrumb={{
          parents: [{ label: "Subcarteiras", to: "/subportfolios" }],
          current: subportfolio.name,
        }}
        title={
          <>
            <SubportfolioMark identity={subportfolio} />
            {subportfolio.name}
          </>
        }
        description={
          <>
            Subcarteira com {items} {items === 1 ? "item" : "itens"}
            {slice && (
              <>
                {" · "}
                <Money value={slice.value} /> · {formatPercent(slice.share)} da carteira
              </>
            )}
          </>
        }
        actions={
          <>
            <MembersDialog subportfolio={subportfolio} />
            <TargetsDialog subportfolioId={subportfolio.id} />
            <NameDialog
              title={`Renomear ${subportfolio.name}`}
              initialName={subportfolio.name}
              save={rename}
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label={`Renomear ${subportfolio.name}`}>
                  <Pencil />
                </Button>
              }
            />
            <DeleteDialog
              name={subportfolio.name}
              description="Os ativos e os títulos dela voltam a ficar só na carteira geral."
              remove={remove}
            />
          </>
        }
      >
        <TabsList>
          <TabsTrigger value="current">Atual × meta</TabsTrigger>
          <TabsTrigger value="rebalance">Rebalancear</TabsTrigger>
        </TabsList>
      </PageHeader>

      {rebalance.error ? (
        <span className="text-destructive">{getApiErrorMessage(rebalance.error)}</span>
      ) : !rebalance.data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <TabsContent value="current" className="flex flex-col gap-6">
            <CurrentVsTarget rebalance={rebalance.data} subportfolioId={subportfolio.id} />
          </TabsContent>
          <TabsContent value="rebalance" className="flex flex-col gap-6">
            {rebalance.data.complete ? (
              <RebalancePanel subportfolioId={subportfolio.id} cash={cash.data?.balance ?? null} />
            ) : (
              <p className="text-muted-foreground">
                Sem metas somando 100%, não há como dividir o aporte. Defina as metas em Metas.
              </p>
            )}
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}

export function SubportfolioDetailPage() {
  const subportfolioId = Number(useParams().subportfolioId);
  const { data, isPending, error } = useSubportfolios();

  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  if (isPending) return <Skeleton className="h-40 w-full" />;
  const subportfolio = data.find((item) => item.id === subportfolioId);
  // A subcarteira apagada volta para a lista
  if (!subportfolio) return <Navigate to="/subportfolios" replace />;
  return <Detail subportfolio={subportfolio} />;
}
