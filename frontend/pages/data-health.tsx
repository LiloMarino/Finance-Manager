import { CircleCheck } from "lucide-react";

import { IssuesTable } from "@/features/data-health/issues-table";
import { type DataIssue, useDataHealth } from "@/features/data-health/use-data-health";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

// Cada tipo de problema com o título da seção, a explicação e a ação que o resolve
const sections: {
  kind: DataIssue["kind"];
  title: string;
  description: string;
  subjectLabel: string;
  actionLabel: string;
}[] = [
  {
    kind: "missing_prices",
    title: "Cotações faltando",
    description:
      "Dias em que houve posição no ativo e a fonte de cotações não tem o preço. Ticker trocado se resolve com \"Trocar ticker\" no ativo.",
    subjectLabel: "Ativo",
    actionLabel: "Ver ativo",
  },
  {
    kind: "late_series",
    title: "Séries do BCB atrasadas",
    description:
      "A última publicação do CDI, da Selic ou do IPCA ainda não chegou ao cache, além da folga normal de publicação.",
    subjectLabel: "Série",
    actionLabel: "Abrir Mercado",
  },
  {
    kind: "fixed_income_without_application",
    title: "Renda fixa sem aplicação",
    description: "Título cadastrado sem nenhuma aplicação registrada.",
    subjectLabel: "Título",
    actionLabel: "Registrar aplicação",
  },
  {
    kind: "missing_cnpj",
    title: "Ativos sem CNPJ",
    description:
      "O item de Bens e Direitos do IRPF pede o CNPJ de cada ativo declarado no ano.",
    subjectLabel: "Ativo",
    actionLabel: "Editar ativo",
  },
  {
    kind: "unclassified_asset",
    title: "Ativos sem setor ou segmento",
    description:
      "A distribuição por setor e segmento da Carteira junta esses ativos em Sem classificação.",
    subjectLabel: "Ativo",
    actionLabel: "Editar ativo",
  },
];

export function DataHealthPage() {
  const { data, isPending, error } = useDataHealth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Saúde dos dados</h1>
        <p className="text-muted-foreground">
          Os buracos de dado que deixam algum número do app errado, com o que falta e onde
          se corrige.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground flex items-center gap-2">
          <CircleCheck className="size-4" />
          Nenhum problema: todos os números têm o dado de que precisam.
        </p>
      ) : (
        sections.map((section) => {
          const issues = data.filter((issue) => issue.kind === section.kind);
          if (issues.length === 0) {
            return null;
          }
          return (
            <Card key={section.kind}>
              <CardHeader>
                <CardTitle>
                  {section.title} ({issues.length})
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <IssuesTable
                  issues={issues}
                  subjectLabel={section.subjectLabel}
                  actionLabel={section.actionLabel}
                />
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
