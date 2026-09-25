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

const UNCLASSIFIED = "none";

interface SegmentSelectProps {
  id: string;
  value: number | null;
  onChange: (segmentId: number | null) => void;
}

/** Os segmentos agrupados pelo setor; nulo é "sem classificação". */
export function SegmentSelect({ id, value, onChange }: SegmentSelectProps) {
  const { data: sectors = [] } = useSectors();

  return (
    <Select
      value={value === null ? UNCLASSIFIED : String(value)}
      onValueChange={(next) => onChange(next === UNCLASSIFIED ? null : Number(next))}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNCLASSIFIED}>Sem classificação</SelectItem>
        {sectors
          .filter((sector) => sector.segments.length > 0)
          .map((sector) => (
            <SelectGroup key={sector.id}>
              <SelectLabel>{sector.name}</SelectLabel>
              {sector.segments.map((segment) => (
                <SelectItem key={segment.id} value={String(segment.id)}>
                  {segment.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
      </SelectContent>
    </Select>
  );
}
