import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  type Benchmark,
  benchmarkConfig,
  benchmarks,
  isBenchmark,
} from "@/shared/lib/benchmark";

// O Select do Radix reserva o valor vazio para "nada escolhido"
const NONE = "none";

interface BenchmarkSelectProps {
  value: Benchmark | undefined;
  onChange: (value: Benchmark | undefined) => void;
}

export function BenchmarkSelect({ value, onChange }: BenchmarkSelectProps) {
  return (
    <Select
      value={value ?? NONE}
      onValueChange={(selected) => onChange(isBenchmark(selected) ? selected : undefined)}
    >
      <SelectTrigger className="w-44" aria-label="Referência">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Sem referência</SelectItem>
        {benchmarks.map((benchmark) => (
          <SelectItem key={benchmark} value={benchmark}>
            Comparar com {benchmarkConfig[benchmark].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
