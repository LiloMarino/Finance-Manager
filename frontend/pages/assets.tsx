import { Boxes, FileUp, Plus, Shapes } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { AssetFormDialog } from "@/features/assets/asset-form-dialog";
import { AssetsTable } from "@/features/assets/assets-table";
import { UnclassifiedAssets } from "@/features/assets/unclassified-assets";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import { SectorCard } from "@/features/sectors/sector-card";
import { useCreateSector } from "@/features/sectors/use-sector-mutations";
import { NameDialog } from "@/shared/components/name-dialog";
import { PageHeader } from "@/shared/components/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useAssets } from "@/shared/hooks/use-assets";
import { useSectors } from "@/shared/hooks/use-sectors";
import { getApiErrorMessage } from "@/shared/lib/api";

const tabs = ["list", "sectors"] as const;
type Tab = (typeof tabs)[number];

function isTab(value: string | null): value is Tab {
  return tabs.some((tab) => tab === value);
}

export function AssetsPage() {
  const assets = useAssets();
  const sectors = useSectors();
  const portfolio = usePortfolio({});
  const createSector = useCreateSector();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: Tab = isTab(requested) ? requested : "list";

  // Sem segmento, só os que estão em carteira: são os que a Carteira mostra sem classificação
  const held = new Set(portfolio.data?.positions.map((position) => position.asset_id));
  const unclassified = (assets.data ?? []).filter(
    (asset) => asset.segment_id === null && held.has(asset.id),
  );

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => setSearchParams(next === "list" ? {} : { tab: String(next) })}
      className="gap-6"
    >
      <PageHeader
        title="Ativos"
        description="O cadastro de cada ativo e a classificação por setor e segmento. A importação cria os ativos que ainda não existem."
        actions={
          tab === "list" ? (
            <AssetFormDialog
              trigger={
                <Button>
                  <Plus />
                  Novo ativo
                </Button>
              }
            />
          ) : (
            <NameDialog
              title="Novo setor"
              save={createSector}
              trigger={
                <Button>
                  <Plus />
                  Novo setor
                </Button>
              }
            />
          )
        }
      >
        <TabsList>
          <TabsTrigger value="list">Ativos</TabsTrigger>
          <TabsTrigger value="sectors">
            Setores
            {unclassified.length > 0 && (
              <Badge variant="count-warning">{unclassified.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </PageHeader>

      <TabsContent value="list" className="flex flex-col gap-6">
        {assets.isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : assets.error ? (
          <span className="text-destructive">{getApiErrorMessage(assets.error)}</span>
        ) : assets.data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Boxes />
              </EmptyMedia>
              <EmptyTitle>Nenhum ativo cadastrado</EmptyTitle>
              <EmptyDescription>
                A importação das notas e do extrato cria os ativos que ainda não existem. À mão,
                basta o ticker e a categoria.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" nativeButton={false} render={<Link to="/import" />}>
                <FileUp />
                Importar notas e extrato
              </Button>
              <AssetFormDialog
                trigger={
                  <Button>
                    <Plus />
                    Novo ativo
                  </Button>
                }
              />
            </EmptyContent>
          </Empty>
        ) : (
          <AssetsTable assets={assets.data} />
        )}
      </TabsContent>

      <TabsContent value="sectors" className="flex flex-col gap-6">
        {unclassified.length > 0 && <UnclassifiedAssets assets={unclassified} />}
        {sectors.isPending ? (
          <Skeleton className="h-40 w-full" />
        ) : sectors.error ? (
          <span className="text-destructive">{getApiErrorMessage(sectors.error)}</span>
        ) : sectors.data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Shapes />
              </EmptyMedia>
              <EmptyTitle>Nenhum setor cadastrado</EmptyTitle>
              <EmptyDescription>
                Crie um setor e os segmentos dele, e classifique os ativos pelo Editar de cada um ou
                pela lista acima. A Carteira mostra a renda variável dividida por eles.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <NameDialog
                title="Novo setor"
                save={createSector}
                trigger={
                  <Button>
                    <Plus />
                    Novo setor
                  </Button>
                }
              />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sectors.data.map((sector) => (
              <SectorCard key={sector.id} sector={sector} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
