import { CircleCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { PendingAlert } from "@/features/data-health/pending-alerts";
import { type DataIssue, useDataHealth } from "@/features/data-health/use-data-health";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";

// As pendências que só melhoram o app, uma lista de ativos por tipo, com o destino de cada
const infoSections: {
  kind: DataIssue["kind"];
  title: string;
  description: string;
  action: string;
  to: string;
}[] = [
  {
    kind: "missing_cnpj",
    title: "Ativos sem CNPJ",
    description: "O item de Bens e Direitos do IRPF pede o CNPJ",
    action: "Preencher em Ativos",
    to: "/assets",
  },
  {
    kind: "unclassified_asset",
    title: "Ativos sem segmento",
    description: "Na Carteira, eles entram em Sem classificação",
    action: "Classificar em Ativos › Setores",
    to: "/assets?tab=sectors",
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-eyebrow text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}

/** A aba Pendências: o que pede ação, o que deixa um número errado ou longe da meta e o
que só melhora o app. */
export function IssuesPanel() {
  const { data, isPending, error } = useDataHealth();

  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (error) return <span className="text-destructive">{getApiErrorMessage(error)}</span>;
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground flex items-center gap-2">
        <CircleCheck className="size-4" />
        Nenhuma pendência: todos os números têm o dado de que precisam.
      </p>
    );
  }

  const critical = data.filter((issue) => issue.severity === "critical");
  const warning = data.filter((issue) => issue.severity === "warning");
  const info = infoSections.flatMap((section) => {
    const issues = data.filter((issue) => issue.kind === section.kind);
    return issues.length > 0 ? [{ ...section, issues }] : [];
  });

  return (
    <>
      {critical.length > 0 && (
        <Section title="Pede ação">
          {critical.map((issue) => (
            <PendingAlert key={`${issue.kind}-${issue.subject}`} issue={issue} />
          ))}
        </Section>
      )}
      {warning.length > 0 && (
        <Section title="Deixa um número errado ou longe da meta">
          {warning.map((issue) => (
            <PendingAlert key={`${issue.kind}-${issue.subject}`} issue={issue} />
          ))}
        </Section>
      )}
      {info.length > 0 && (
        <Section title="Melhora o app, sem mudar número de hoje">
          {info.map((section) => (
            <Card key={section.kind}>
              <CardHeader>
                <CardTitle>
                  {section.title} · {section.issues.length}
                </CardTitle>
                <CardAction>
                  <span className="text-caption text-muted-foreground">{section.description}</span>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                {section.issues.map((issue) => (
                  <Badge key={issue.subject} variant="outline">
                    <span className="text-ticker font-mono">{issue.subject}</span>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  nativeButton={false}
                  render={<Link to={section.to} />}
                >
                  {section.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Section>
      )}
      <p className="text-caption text-muted-foreground">
        O contador da sidebar soma só as pendências que pedem ação e as que deixam um número errado.
      </p>
    </>
  );
}
