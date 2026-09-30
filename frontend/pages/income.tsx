import { FileUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { IncomeDistributionPanel } from "@/features/income/income-distribution";
import { IncomeFormDialog } from "@/features/income/income-form-dialog";
import { IncomeHistory } from "@/features/income/income-history";
import { IncomePerformancePanel } from "@/features/income/income-performance";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useSubportfolioParam } from "@/shared/hooks/use-subportfolio-param";

export function IncomePage() {
  const [subportfolioId] = useSubportfolioParam();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Proventos</h1>
          <p className="text-muted-foreground">
            Dividendos, JCP e rendimentos recebidos, pelo valor líquido que caiu na conta.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" nativeButton={false} render={<Link to="/import" />}>
            <FileUp />
            Importar
          </Button>
          <IncomeFormDialog
            trigger={
              <Button>
                <Plus />
                Novo provento
              </Button>
            }
          />
        </div>
      </div>

      <Tabs defaultValue="performance" className="gap-6">
        <TabsList>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardContent>
              <IncomePerformancePanel subportfolioId={subportfolioId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardContent>
              <IncomeDistributionPanel subportfolioId={subportfolioId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <IncomeHistory subportfolioId={subportfolioId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
