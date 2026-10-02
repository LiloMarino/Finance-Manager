import { ChevronRight, FileUp, Landmark, PieChart, Plus, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

function StartCard({
  to,
  icon,
  title,
  text,
}: {
  to: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link to={to}>
      <Card data-interactive className="flex-row items-center gap-4 px-5">
        <span className="bg-muted text-ink-2 grid size-9 shrink-0 place-items-center rounded-lg">
          {icon}
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="font-semibold">{title}</span>
          <span className="text-caption text-muted-foreground">{text}</span>
        </span>
        <ChevronRight className="text-muted-foreground size-4" />
      </Card>
    </Link>
  );
}

/** A Carteira sem nenhuma posição: os caminhos para começar. */
export function PortfolioEmpty() {
  return (
    <>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PieChart />
          </EmptyMedia>
          <EmptyTitle>Sua carteira ainda está vazia</EmptyTitle>
          <EmptyDescription>
            Importe as notas de corretagem em PDF e o extrato de movimentação da B3. O app monta as
            posições, o preço médio e o histórico a partir delas.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" render={<Link to="/operations" />}>
            <Plus />
            Registrar à mão
          </Button>
          <Button render={<Link to="/import" />}>
            <FileUp />
            Importar notas e extrato
          </Button>
        </EmptyContent>
      </Empty>

      {/* Outros começos */}
      <div className="grid gap-4 md:grid-cols-2">
        <StartCard
          to="/fixed-income"
          icon={<Landmark className="size-4" />}
          title="Cadastrar um título de renda fixa"
          text="CDB, LCI, Tesouro: entram pelo valor aplicado e pela taxa."
        />
        <StartCard
          to="/cash"
          icon={<Wallet className="size-4" />}
          title="Informar o saldo na corretora"
          text="O dinheiro parado entra no patrimônio."
        />
      </div>
    </>
  );
}
