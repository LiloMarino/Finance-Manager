import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useSectors } from "@/shared/hooks/use-sectors";

interface SegmentSelectProps {
  id: string;
  value: number | null;
  onChange: (segmentId: number | null) => void;
}

/** Os segmentos agrupados pelo setor; nulo é "sem classificação". */
export function SegmentSelect({ id, value, onChange }: SegmentSelectProps) {
  const { data: sectors = [] } = useSectors();
  const items = [
    { value: null, label: "Sem classificação" },
    ...sectors.flatMap((sector) =>
      sector.segments.map((segment) => ({ value: segment.id, label: segment.name })),
    ),
  ];

  return (
    <Select items={items} value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>Sem classificação</SelectItem>
        {sectors
          .filter((sector) => sector.segments.length > 0)
          .map((sector) => (
            <SelectGroup key={sector.id}>
              <SelectLabel>{sector.name}</SelectLabel>
              {sector.segments.map((segment) => (
                <SelectItem key={segment.id} value={segment.id}>
                  {segment.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
      </SelectContent>
    </Select>
  );
}
