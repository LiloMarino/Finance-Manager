import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/shared/components/ui/combobox";
import { type Sector, useSectors } from "@/shared/hooks/use-sectors";

interface SegmentItem {
  /** Nulo é "sem classificação". */
  value: number | null;
  label: string;
  /** O nome digitado, no item que cria um segmento novo. */
  creatable?: string;
}

interface SegmentGroup {
  value: string;
  label: string;
  items: SegmentItem[];
}

const UNCLASSIFIED: SegmentItem = { value: null, label: "Sem classificação" };

function segmentGroups(sectors: Sector[]): SegmentGroup[] {
  return [
    { value: "none", label: "", items: [UNCLASSIFIED] },
    ...sectors
      .filter((sector) => sector.segments.length > 0)
      .map((sector) => ({
        value: String(sector.id),
        label: sector.name,
        items: sector.segments.map((segment) => ({ value: segment.id, label: segment.name })),
      })),
  ];
}

interface SegmentComboboxProps {
  id: string;
  value: number | null;
  onChange: (segmentId: number | null) => void;
  /** Pede a criação de um segmento com o nome digitado. */
  onCreate: (name: string) => void;
}

/** Os segmentos agrupados pelo setor, com busca. O texto que não é segmento nenhum
vira a opção de criar um. */
export function SegmentCombobox({ id, value, onChange, onCreate }: SegmentComboboxProps) {
  const { data: sectors } = useSectors();
  const [query, setQuery] = useState("");
  // O item escolhido mantém a identidade entre renders: o Combobox reescreve o texto
  // do campo quando o valor muda, e um objeto novo a cada render apagaria a digitação
  const groups = useMemo(() => segmentGroups(sectors ?? []), [sectors]);
  const all = groups.flatMap((group) => group.items);
  const selected = all.find((item) => item.value === value) ?? UNCLASSIFIED;
  const typed = query.trim();
  const exists = all.some((item) => item.label.toLowerCase() === typed.toLowerCase());
  const items =
    typed && !exists
      ? [
          ...groups,
          {
            value: "create",
            label: "",
            items: [{ value: null, label: `Criar "${typed}"`, creatable: typed }],
          },
        ]
      : groups;

  return (
    <Combobox
      items={items}
      value={selected}
      onInputValueChange={setQuery}
      onValueChange={(item) => {
        if (item?.creatable) onCreate(item.creatable);
        else onChange(item?.value ?? null);
      }}
    >
      <ComboboxInput id={id} className="w-full" placeholder="Buscar ou criar segmento" />
      <ComboboxContent>
        <ComboboxEmpty>Nenhum segmento com esse nome.</ComboboxEmpty>
        <ComboboxList>
          {(group: SegmentGroup) => (
            <ComboboxGroup key={group.value} items={group.items}>
              {group.label && <ComboboxLabel>{group.label}</ComboboxLabel>}
              <ComboboxCollection>
                {(item: SegmentItem) => (
                  <ComboboxItem key={item.creatable ? "create" : String(item.value)} value={item}>
                    {item.creatable && <Plus />}
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
