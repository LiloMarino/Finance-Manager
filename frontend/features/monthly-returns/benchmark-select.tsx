import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { type Benchmark, benchmarkConfig, benchmarks } from "@/shared/lib/benchmark";

const items = [
  { value: null, label: "Nenhuma" },
  ...benchmarks.map((benchmark) => ({
    value: benchmark,
    label: benchmarkConfig[benchmark].label,
  })),
];

interface BenchmarkSelectProps {
  value: Benchmark | undefined;
  onChange: (value: Benchmark | undefined) => void;
}

export function BenchmarkSelect({ value, onChange }: BenchmarkSelectProps) {
  return (
    <Select
      items={items}
      value={value ?? null}
      onValueChange={(selected) => onChange(selected ?? undefined)}
    >
      <SelectTrigger size="sm" className="w-32" aria-label="Referência">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.label} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
