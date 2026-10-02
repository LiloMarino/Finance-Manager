import { Children, type ReactNode } from "react";

import { Card, CardContent } from "@/shared/components/ui/card";

interface VerdictCardProps {
  title: ReactNode;
  text: ReactNode;
  /** Os indicadores que sustentam a resposta, numa faixa embaixo dela. */
  children: ReactNode;
}

/** A resposta da simulação em uma frase, com os números embaixo. */
export function VerdictCard({ title, text, children }: VerdictCardProps) {
  return (
    <Card variant="positive" className="gap-0 py-0">
      <CardContent className="flex flex-col gap-1 py-4">
        <span className="text-page-title">{title}</span>
        <span className="text-ink-2">{text}</span>
      </CardContent>
      <div className="border-border grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] border-t">
        {Children.toArray(children).map((child, index) => (
          <div key={index} className="border-border border-l px-5 py-4 first:border-l-0">
            {child}
          </div>
        ))}
      </div>
    </Card>
  );
}
