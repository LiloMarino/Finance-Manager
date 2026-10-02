import { RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { ScheduleCard } from "@/features/alert/schedule-card";
import { IssuesPanel } from "@/features/data-health/issues-panel";
import { useDataHealth } from "@/features/data-health/use-data-health";
import { MarketPanel } from "@/features/market/market-panel";
import { useRefreshIndexes } from "@/features/market/use-refresh-indexes";
import { useRefreshPrices } from "@/features/market/use-refresh-prices";
import { PageHeader } from "@/shared/components/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

const tabs = ["issues", "market", "alert"] as const;
type Tab = (typeof tabs)[number];

function isTab(value: string | null): value is Tab {
  return tabs.some((tab) => tab === value);
}

export function DataPage() {
  const { data: issues = [] } = useDataHealth();
  const refreshPrices = useRefreshPrices();
  const refreshIndexes = useRefreshIndexes();
  const refreshing = refreshPrices.isPending || refreshIndexes.isPending;
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: Tab = isTab(requested) ? requested : "issues";

  // O contador soma só o que pede ação ou deixa um número errado
  const counted = issues.filter((issue) => issue.severity !== "info");
  const critical = counted.some((issue) => issue.severity === "critical");

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => setSearchParams(next === "issues" ? {} : { tab: String(next) })}
      className="gap-6"
    >
      <PageHeader
        title="Dados"
        description="O que falta para os números do app estarem certos, o último dado de cada cotação e série, e o alerta diário."
        actions={
          <Button
            variant="outline"
            disabled={refreshing}
            onClick={() => {
              refreshPrices.mutate();
              refreshIndexes.mutate();
            }}
          >
            <RefreshCw className={refreshing ? "animate-spin" : undefined} />
            Atualizar mercado
          </Button>
        }
      >
        <TabsList>
          <TabsTrigger value="issues">
            Pendências
            {counted.length > 0 && (
              <Badge variant={critical ? "count-critical" : "count-warning"}>
                {counted.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="market">Mercado</TabsTrigger>
          <TabsTrigger value="alert">Alerta diário</TabsTrigger>
        </TabsList>
      </PageHeader>

      <TabsContent value="issues" className="flex flex-col gap-6">
        <IssuesPanel />
      </TabsContent>
      <TabsContent value="market" className="flex flex-col gap-6">
        <MarketPanel />
      </TabsContent>
      <TabsContent value="alert" className="flex flex-col gap-6">
        <ScheduleCard />
      </TabsContent>
    </Tabs>
  );
}
