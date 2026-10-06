import { ChartArea, FileUp, FolderTree, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { useEvolution } from "@/features/evolution/use-evolution";
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
import { getApiErrorMessage } from "@/shared/lib/api";

interface RequireHistoryProps {
  /** A subcarteira que a tela mostra; sem ela, vale a carteira inteira. */
  subportfolioId?: number;
  children: ReactNode;
}

/** As análises partem da série do patrimônio desde o início, que junta operações, títulos
e saldo. Série vazia é carteira sem nada registrado, e a tela mostra o caminho para começar;
uma carteira toda vendida tem série, e segue mostrando o histórico. */
export function RequireHistory({ subportfolioId, children }: RequireHistoryProps) {
  const { data, isPending, error } = useEvolution({ subportfolio_id: subportfolioId });

  if (isPending) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (error) {
    return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  }
  if (data.points.length > 0) {
    return children;
  }

  if (subportfolioId !== undefined) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderTree />
          </EmptyMedia>
          <EmptyTitle>A subcarteira ainda está vazia</EmptyTitle>
          <EmptyDescription>
            Escolha os ativos e os títulos dela em Subcarteiras, ou troque a carteira no topo da
            sidebar.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" nativeButton={false} render={<Link to="/subportfolios" />}>
            Ver subcarteiras
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ChartArea />
        </EmptyMedia>
        <EmptyTitle>Nada para analisar ainda</EmptyTitle>
        <EmptyDescription>
          As análises partem das operações, dos títulos de renda fixa e do saldo. Importe as notas
          de corretagem e o extrato da B3, ou registre à mão.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" nativeButton={false} render={<Link to="/operations" />}>
          <Plus />
          Registrar à mão
        </Button>
        <Button nativeButton={false} render={<Link to="/import" />}>
          <FileUp />
          Importar notas e extrato
        </Button>
      </EmptyContent>
    </Empty>
  );
}
