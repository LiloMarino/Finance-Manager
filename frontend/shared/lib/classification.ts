import type { Sector } from "@/shared/hooks/use-sectors";
import type { components } from "@/types/openapi.generated";

export type Suggestion = components["schemas"]["SuggestionDTO"];

/** O que a fonte diz do ticker, em inglês: "Financial Services · Banks - Regional". */
export function sourceLabel(suggestion: Suggestion): string {
  return [suggestion.source_sector, suggestion.source_industry]
    .filter((part) => part !== null)
    .join(" · ");
}

/** "Setor / Segmento" pelo nome de hoje, que é o que o usuário deu. */
export function segmentLabel(sectors: Sector[], segmentId: number): string | undefined {
  for (const sector of sectors) {
    const segment = sector.segments.find((item) => item.id === segmentId);
    if (segment) return `${sector.name} / ${segment.name}`;
  }
  return undefined;
}
