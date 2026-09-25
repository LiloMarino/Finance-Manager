import { FileUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { IncomeDistributionPanel } from "@/features/income/income-distribution";
import { IncomeFormDialog } from "@/features/income/income-form-dialog";
import { IncomeHistory } from "@/features/income/income-history";
import { IncomePerformancePanel } from "@/features/income/income-performance";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function IncomePage() {
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
          <Button variant="outline" asChild>
            <Link to="/import">
              <FileUp />
              Importar
            </Link>
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
              <IncomePerformancePanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardContent>
              <IncomeDistributionPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <IncomeHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
